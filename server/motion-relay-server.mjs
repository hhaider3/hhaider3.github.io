import http from 'node:http';

const port = Number(process.env.PORT || 8787);
const sessionTtlMs = Number(process.env.MOTION_SESSION_TTL_MS || 30 * 60 * 1000);
const maxPayloadBytes = Number(process.env.MOTION_MAX_PAYLOAD_BYTES || 200_000);
const configuredPublicOrigin = process.env.PUBLIC_RELAY_ORIGIN || '';
const allowedOrigins = (process.env.MOTION_ALLOWED_ORIGINS || '*')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const sessions = new Map();

const getRequestOrigin = (req) => {
  if (configuredPublicOrigin) {
    return configuredPublicOrigin.replace(/\/$/, '');
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${port}`;
  const protocol = req.headers['x-forwarded-proto'] || (req.socket.encrypted ? 'https' : 'http');
  return `${protocol}://${host}`;
};

const isOriginAllowed = (origin) => {
  if (allowedOrigins.includes('*')) {
    return true;
  }

  return Boolean(origin && allowedOrigins.includes(origin));
};

const setCorsHeaders = (req, res) => {
  const requestOrigin = req.headers.origin;
  const allowOrigin = isOriginAllowed(requestOrigin) ? requestOrigin : allowedOrigins[0];

  if (allowOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');
};

const sendJson = (req, res, statusCode, payload) => {
  setCorsHeaders(req, res);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
};

const readJsonBody = (req) => new Promise((resolve, reject) => {
  let body = '';

  req.on('data', chunk => {
    body += chunk;
    if (body.length > maxPayloadBytes) {
      reject(new Error('Payload too large'));
      req.destroy();
    }
  });

  req.on('end', () => {
    try {
      resolve(body ? JSON.parse(body) : {});
    } catch {
      reject(new Error('Invalid JSON'));
    }
  });

  req.on('error', reject);
});

const getSession = (sessionId) => {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      clients: new Set(),
      createdAt: Date.now(),
      lastPacket: null,
      updatedAt: Date.now(),
    });
  }

  const session = sessions.get(sessionId);
  session.updatedAt = Date.now();
  return session;
};

const broadcast = (sessionId, eventName, payload) => {
  const session = getSession(sessionId);
  const message = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;

  session.clients.forEach(client => {
    try {
      client.write(message);
    } catch {
      session.clients.delete(client);
    }
  });
};

const handleConfig = (req, res) => {
  if (req.method !== 'GET') {
    sendJson(req, res, 405, { error: 'Method not allowed' });
    return;
  }

  const relayOrigin = getRequestOrigin(req);
  sendJson(req, res, 200, {
    relayAvailable: true,
    relayOrigin,
    localOrigin: relayOrigin,
    lanOrigins: [],
    preferredOrigin: relayOrigin,
    secure: relayOrigin.startsWith('https://'),
  });
};

const handleEvents = (req, res, url) => {
  if (req.method !== 'GET') {
    sendJson(req, res, 405, { error: 'Method not allowed' });
    return;
  }

  const sessionId = url.searchParams.get('s');
  if (!sessionId) {
    sendJson(req, res, 400, { error: 'Missing session id' });
    return;
  }

  const session = getSession(sessionId);
  setCorsHeaders(req, res);
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write(`event: hello\ndata: ${JSON.stringify({ sessionId, relayOrigin: getRequestOrigin(req) })}\n\n`);

  if (session.lastPacket) {
    res.write(`event: sensor\ndata: ${JSON.stringify(session.lastPacket)}\n\n`);
  }

  session.clients.add(res);
  const keepAlive = setInterval(() => {
    res.write(`event: ping\ndata: ${JSON.stringify({ now: Date.now() })}\n\n`);
  }, 15_000);

  req.on('close', () => {
    clearInterval(keepAlive);
    session.clients.delete(res);
  });
};

const handlePublish = async (req, res) => {
  if (req.method !== 'POST') {
    sendJson(req, res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const packet = await readJsonBody(req);
    const sessionId = packet.sessionId || packet.s;

    if (!sessionId) {
      sendJson(req, res, 400, { error: 'Missing session id' });
      return;
    }

    const session = getSession(sessionId);
    const enrichedPacket = {
      ...packet,
      sessionId,
      relayReceivedAt: Date.now(),
    };
    session.lastPacket = enrichedPacket;
    session.updatedAt = Date.now();
    broadcast(sessionId, 'sensor', enrichedPacket);
    sendJson(req, res, 200, { ok: true, listeners: session.clients.size });
  } catch (error) {
    sendJson(req, res, 400, { error: error.message || 'Invalid sensor packet' });
  }
};

const pruneSessions = () => {
  const cutoff = Date.now() - sessionTtlMs;

  sessions.forEach((session, sessionId) => {
    if (session.updatedAt >= cutoff || session.clients.size > 0) {
      return;
    }

    sessions.delete(sessionId);
  });
};

setInterval(pruneSessions, 60_000).unref();

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', getRequestOrigin(req));

  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    res.statusCode = 204;
    res.end();
    return;
  }

  if (url.pathname === '/' || url.pathname === '/health') {
    sendJson(req, res, 200, {
      ok: true,
      service: 'motion-relay',
      sessions: sessions.size,
      now: Date.now(),
    });
    return;
  }

  if (url.pathname === '/api/motion/config') {
    handleConfig(req, res);
    return;
  }

  if (url.pathname === '/api/motion/events') {
    handleEvents(req, res, url);
    return;
  }

  if (url.pathname === '/api/motion/publish') {
    handlePublish(req, res);
    return;
  }

  sendJson(req, res, 404, { error: 'Not found' });
});

server.listen(port, () => {
  console.log(`Motion relay listening on http://localhost:${port}`);
});
