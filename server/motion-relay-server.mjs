import http from 'node:http';
import { createMotionRelay } from './motion-relay.mjs';

const port = Number(process.env.PORT || 8787);
const sessionTtlMs = Number(process.env.MOTION_SESSION_TTL_MS || 30 * 60 * 1000);
const maxPayloadBytes = Number(process.env.MOTION_MAX_PAYLOAD_BYTES || 200_000);
const configuredPublicOrigin = process.env.PUBLIC_RELAY_ORIGIN || '';
const allowedOrigins = (process.env.MOTION_ALLOWED_ORIGINS || '*')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const getRequestOrigin = (req) => {
  if (configuredPublicOrigin) {
    return configuredPublicOrigin.replace(/\/$/, '');
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${port}`;
  const protocol = req.headers['x-forwarded-proto'] || (req.socket.encrypted ? 'https' : 'http');
  return `${protocol}://${host}`;
};

const relay = createMotionRelay({
  allowedOrigins,
  sessionTtlMs,
  maxPayloadBytes,
  healthEndpoints: true,
  getOrigins: (req) => {
    const relayOrigin = getRequestOrigin(req);
    return {
      relayAvailable: true,
      relayOrigin,
      localOrigin: relayOrigin,
      lanOrigins: [],
      preferredOrigin: relayOrigin,
      secure: relayOrigin.startsWith('https://'),
    };
  },
});

const server = http.createServer(relay.handleRequest);
server.on('upgrade', (req, socket, head) => {
  if (!relay.handleUpgrade(req, socket, head)) {
    socket.end('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n');
  }
});
server.on('close', relay.close);
server.listen(port, () => {
  console.log(`Motion relay listening on http://localhost:${port}`);
});
