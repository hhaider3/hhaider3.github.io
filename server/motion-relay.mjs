import {
  acceptWebSocket,
  createWebSocketParser,
  webSocketPath,
  writeWebSocketJson,
} from './websocket-relay.mjs';

export const createMotionRelay = ({
  getOrigins,
  allowedOrigins = ['*'],
  sessionTtlMs = 30 * 60 * 1000,
  maxPayloadBytes = 200_000,
  healthEndpoints = false,
}) => {
  const sessions = new Map();

  const isOriginAllowed = (origin) => {
    if (allowedOrigins.includes('*')) {
      return true;
    }

    return Boolean(origin && allowedOrigins.includes(origin));
  };

  const setCorsHeaders = (req, res) => {
    const requestOrigin = req.headers.origin;
    const allowOrigin = requestOrigin && isOriginAllowed(requestOrigin) ? requestOrigin : allowedOrigins[0];

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
        publishers: new Set(),
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

  const publishPacket = (sessionId, packet) => {
    const session = getSession(sessionId);
    const enrichedPacket = {
      ...packet,
      sessionId,
      relayReceivedAt: Date.now(),
    };
    session.lastPacket = enrichedPacket;
    session.updatedAt = Date.now();
    broadcast(sessionId, 'sensor', enrichedPacket);

    return {
      packet: enrichedPacket,
      listeners: session.clients.size,
    };
  };

  const sendFeedback = (sessionId, feedback) => {
    const session = getSession(sessionId);
    let delivered = 0;

    session.publishers.forEach((socket) => {
      if (socket.destroyed || !socket.writable) {
        session.publishers.delete(socket);
        return;
      }

      try {
        writeWebSocketJson(socket, {
          type: 'feedback',
          feedback: feedback.feedback || 'hit',
          intensity: Number(feedback.intensity) || 0,
          color: feedback.color,
          sentAt: Date.now(),
        });
        delivered += 1;
      } catch {
        session.publishers.delete(socket);
      }
    });

    return delivered;
  };

  const handleConfig = (req, res) => {
    if (req.method !== 'GET') {
      sendJson(req, res, 405, { error: 'Method not allowed' });
      return;
    }

    sendJson(req, res, 200, getOrigins(req));
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
    res.write(`event: hello\ndata: ${JSON.stringify({ sessionId, ...getOrigins(req) })}\n\n`);

    if (session.lastPacket) {
      res.write(`event: sensor\ndata: ${JSON.stringify(session.lastPacket)}\n\n`);
    }

    session.clients.add(res);
    const keepAlive = setInterval(() => {
      res.write(`event: ping\ndata: ${JSON.stringify({ now: Date.now() })}\n\n`);
    }, 15_000);

    res.on('close', () => {
      clearInterval(keepAlive);
      session.clients.delete(res);
    });
  };

  const handlePost = async (req, res, kind) => {
    if (req.method !== 'POST') {
      sendJson(req, res, 405, { error: 'Method not allowed' });
      return;
    }

    try {
      const payload = await readJsonBody(req);
      const sessionId = payload.sessionId || payload.s;
      if (!sessionId) {
        sendJson(req, res, 400, { error: 'Missing session id' });
        return;
      }

      const result = kind === 'publish'
        ? { listeners: publishPacket(sessionId, payload).listeners }
        : { delivered: sendFeedback(sessionId, payload) };
      sendJson(req, res, 200, { ok: true, ...result });
    } catch (error) {
      sendJson(req, res, 400, { error: error.message || 'Invalid payload' });
    }
  };

  const rejectUpgrade = (socket, statusCode, message) => {
    socket.write(`HTTP/1.1 ${statusCode} ${message}\r\nConnection: close\r\n\r\n`);
    socket.destroy();
  };

  const handleUpgrade = (req, socket, head) => {
    const url = new URL(req.url || '/', 'http://motion.local');

    if (url.pathname !== webSocketPath) {
      return false;
    }

    const requestOrigin = req.headers.origin;
    if (requestOrigin && !isOriginAllowed(requestOrigin)) {
      rejectUpgrade(socket, 403, 'Forbidden');
      return true;
    }

    const sessionId = url.searchParams.get('s');
    if (!sessionId) {
      rejectUpgrade(socket, 400, 'Bad Request');
      return true;
    }

    if (!acceptWebSocket(req, socket)) {
      return true;
    }

    const session = getSession(sessionId);
    session.publishers.add(socket);
    let lastStatsAt = 0;

    writeWebSocketJson(socket, {
      type: 'hello',
      sessionId,
      listeners: session.clients.size,
      ...getOrigins(req),
    });

    const parser = createWebSocketParser({
      maxPayloadBytes,
      onText: (message) => {
        const packet = JSON.parse(message);
        const result = publishPacket(sessionId, {
          ...packet,
          sessionId,
        });
        const now = Date.now();

        if (now - lastStatsAt >= 1000) {
          lastStatsAt = now;
          writeWebSocketJson(socket, {
            type: 'stats',
            listeners: result.listeners,
            now,
          });
        }
      },
      onError: () => {
        session.publishers.delete(socket);
      },
    });

    socket.on('data', chunk => parser(chunk, socket));
    socket.on('close', () => {
      session.publishers.delete(socket);
    });
    socket.on('error', () => {
      session.publishers.delete(socket);
    });
    if (head?.length) parser(head, socket);
    return true;
  };

  const pruneSessions = () => {
    const cutoff = Date.now() - sessionTtlMs;

    sessions.forEach((session, sessionId) => {
      if (session.updatedAt >= cutoff || session.clients.size > 0 || session.publishers.size > 0) {
        return;
      }

      sessions.delete(sessionId);
    });
  };

  const pruneTimer = setInterval(pruneSessions, 60_000);
  pruneTimer.unref();

  const handleRequest = (req, res, next) => {
    const url = new URL(req.url || '/', 'http://motion.local');
    const isMotionRequest = url.pathname.startsWith('/api/motion/');

    if (!isMotionRequest && !healthEndpoints) {
      next?.();
      return;
    }

    if (req.method === 'OPTIONS') {
      setCorsHeaders(req, res);
      res.statusCode = 204;
      res.end();
      return;
    }

    if (healthEndpoints && (url.pathname === '/' || url.pathname === '/health')) {
      sendJson(req, res, 200, {
        ok: true, service: 'motion-relay', sessions: sessions.size, now: Date.now(),
      });
      return;
    }

    switch (url.pathname) {
      case '/api/motion/config': return handleConfig(req, res);
      case '/api/motion/events': return handleEvents(req, res, url);
      case '/api/motion/publish': return handlePost(req, res, 'publish');
      case '/api/motion/feedback': return handlePost(req, res, 'feedback');
      default: sendJson(req, res, 404, { error: 'Not found' });
    }
  };

  const close = () => {
    clearInterval(pruneTimer);
    sessions.forEach(session => {
      session.clients.forEach(client => client.end());
      session.publishers.forEach(socket => socket.destroy());
    });
    sessions.clear();
  };

  return { handleRequest, handleUpgrade, close };
};
