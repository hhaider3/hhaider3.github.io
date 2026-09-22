import assert from 'node:assert/strict';
import { once } from 'node:events';
import http from 'node:http';
import test from 'node:test';
import { createMotionRelay } from './motion-relay.mjs';

const origins = {
  relayOrigin: 'https://relay.example',
  preferredOrigin: 'https://relay.example',
  secure: true,
};

async function startRelay(t, options = {}) {
  const relay = createMotionRelay({ getOrigins: () => origins, healthEndpoints: true, ...options });
  const server = http.createServer((req, res) => relay.handleRequest(req, res, () => {
    res.end('next middleware');
  }));
  server.on('upgrade', relay.handleUpgrade);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    relay.close();
    const closed = once(server, 'close');
    server.close();
    server.closeAllConnections();
    await closed;
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const request = (path, options) => fetch(`${origin}${path}`, {
    signal: AbortSignal.timeout(5000), ...options,
  });
  const post = (path, payload) => request(`/api/motion/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  const events = async (session) => {
    const response = await request(`/api/motion/events?s=${session}`);
    assert.equal(response.status, 200);
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    t.after(() => reader.cancel());
    let buffered = '';
    return async (name) => {
      while (true) {
        const boundary = buffered.indexOf('\n\n');
        if (boundary >= 0) {
          const event = buffered.slice(0, boundary);
          buffered = buffered.slice(boundary + 2);
          if (event.startsWith(`event: ${name}\n`)) {
            return JSON.parse(event.slice(event.indexOf('data: ') + 6));
          }
          continue;
        }
        const { value, done } = await reader.read();
        assert.equal(done, false, `Stream ended before ${name}`);
        buffered += value;
      }
    };
  };
  return { origin, request, post, events };
}

test('HTTP packets reach listeners and replay only within their session', { timeout: 5000 }, async (t) => {
  const relay = await startRelay(t);
  const next = await relay.events('alpha');
  assert.deepEqual(await next('hello'), { sessionId: 'alpha', ...origins });
  await relay.post('publish', { sessionId: 'beta', sequence: 99 });
  const sent = await relay.post('publish', { sessionId: 'alpha', sequence: 1 });
  assert.deepEqual(await sent.json(), { ok: true, listeners: 1 });
  const packet = await next('sensor');
  assert.equal(packet.sessionId, 'alpha');
  assert.equal(packet.sequence, 1);
  assert.equal(typeof packet.relayReceivedAt, 'number');

  const replay = await relay.events('alpha');
  await replay('hello');
  assert.deepEqual(await replay('sensor'), packet);
  const beta = await relay.events('beta');
  await beta('hello');
  assert.equal((await beta('sensor')).sequence, 99);
});

test('WebSocket publish and hit feedback use the same sessions as HTTP', { timeout: 5000 }, async (t) => {
  const relay = await startRelay(t);
  const next = await relay.events('alpha');
  await next('hello');
  const socket = new WebSocket(`${relay.origin.replace('http:', 'ws:')}/api/motion/socket?s=alpha`);
  t.after(() => socket.close());
  const [hello] = await once(socket, 'message');
  assert.equal(JSON.parse(hello.data).listeners, 1);

  const stats = once(socket, 'message');
  socket.send(JSON.stringify({ sessionId: 'spoofed', orientation: { alpha: 42, beta: 0, gamma: 0 } }));
  const packet = await next('sensor');
  assert.equal(packet.sessionId, 'alpha');
  assert.equal(packet.orientation.alpha, 42);
  assert.equal(JSON.parse((await stats)[0].data).type, 'stats');

  const feedback = once(socket, 'message');
  const result = await relay.post('feedback', { sessionId: 'alpha', feedback: 'hit', intensity: 0.8 });
  assert.deepEqual(await result.json(), { ok: true, delivered: 1 });
  const message = JSON.parse((await feedback)[0].data);
  assert.equal(message.type, 'feedback');
  assert.equal(message.intensity, 0.8);
  const isolated = await relay.post('feedback', { sessionId: 'beta', feedback: 'hit' });
  assert.equal((await isolated.json()).delivered, 0);
});

test('configuration, CORS, preflight and request validation remain available', async (t) => {
  const relay = await startRelay(t, { allowedOrigins: ['https://portfolio.example'] });
  const config = await relay.request('/api/motion/config', { headers: { Origin: 'https://portfolio.example' } });
  assert.deepEqual(await config.json(), origins);
  assert.equal(config.headers.get('access-control-allow-origin'), 'https://portfolio.example');
  assert.equal((await relay.request('/api/motion/publish', { method: 'OPTIONS' })).status, 204);
  assert.equal((await relay.request('/api/motion/publish')).status, 405);
  assert.equal((await relay.request('/api/motion/events')).status, 400);
  assert.equal((await relay.post('publish', {})).status, 400);
  assert.equal((await relay.post('feedback', {})).status, 400);
  const malformed = await relay.request('/api/motion/publish', { method: 'POST', body: '{' });
  assert.equal(malformed.status, 400);
  assert.deepEqual(await malformed.json(), { error: 'Invalid JSON' });
  assert.equal((await relay.request('/unknown')).status, 404);
  assert.equal((await (await relay.request('/health')).json()).ok, true);
});

test('Vite middleware mode passes app routes through and keeps the relay API', async (t) => {
  const relay = await startRelay(t, { healthEndpoints: false });
  assert.equal(await (await relay.request('/')).text(), 'next middleware');
  assert.equal(await (await relay.request('/motion-phone/example')).text(), 'next middleware');
  assert.equal((await relay.request('/api/motion/config')).status, 200);
  assert.equal((await relay.request('/api/motion/unknown')).status, 404);
});

test('idle sessions expire while connected listeners stay available', async (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setInterval'], now: 1000 });
  const relay = await startRelay(t, { sessionTtlMs: 1000 });
  const active = await relay.events('active');
  await active('hello');
  await relay.post('publish', { sessionId: 'idle' });
  t.mock.timers.tick(60_000);
  const health = await (await relay.request('/health')).json();
  assert.equal(health.sessions, 1);
  const result = await relay.post('publish', { sessionId: 'active', sequence: 2 });
  assert.equal((await result.json()).listeners, 1);
  assert.equal((await active('sensor')).sequence, 2);
});
