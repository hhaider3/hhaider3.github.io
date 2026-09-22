export const publishEndpoint = '/api/motion/publish';
export const feedbackEndpoint = '/api/motion/feedback';
export const socketEndpoint = '/api/motion/socket';
export const configEndpoint = '/api/motion/config';
export const hostedRelayUrl = 'https://motion-lab-relay.onrender.com';
export const configuredRelayUrl = import.meta.env.VITE_MOTION_RELAY_URL || '';
export const createApiUrl = (origin, endpoint) => new URL(endpoint, origin).toString();

export const createSocketUrl = (origin, endpoint) => {
  const url = new URL(endpoint, origin);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
};

export const normalizeOrigin = (value) => {
  if (!value) {
    return '';
  }

  try {
    return new URL(value, window.location.origin).origin;
  } catch {
    return '';
  }
};

export const isLocalNetworkOrigin = (origin = window.location.origin) => {
  try {
    const { hostname } = new URL(origin, window.location.origin);

    return (
      hostname === 'localhost'
      || hostname === '127.0.0.1'
      || hostname === '[::1]'
      || hostname.endsWith('.local')
      || /^10\./.test(hostname)
      || /^192\.168\./.test(hostname)
      || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
    );
  } catch {
    return false;
  }
};

export const getDefaultRelayOrigin = () => (
  normalizeOrigin(configuredRelayUrl)
  || (isLocalNetworkOrigin() ? window.location.origin : hostedRelayUrl)
);

export const createSessionId = () => {
  if (window.crypto?.getRandomValues) {
    const values = new Uint8Array(6);
    window.crypto.getRandomValues(values);
    return Array.from(values, value => value.toString(16).padStart(2, '0')).join('');
  }

  return Math.random().toString(36).slice(2, 14);
};

export const toFiniteNumber = (value) => (
  Number.isFinite(value) ? Number(value) : null
);

export const readVector = (vector) => ({
  x: toFiniteNumber(vector?.x),
  y: toFiniteNumber(vector?.y),
  z: toFiniteNumber(vector?.z),
});

export const readRotationRate = (rotationRate) => ({
  alpha: toFiniteNumber(rotationRate?.alpha),
  beta: toFiniteNumber(rotationRate?.beta),
  gamma: toFiniteNumber(rotationRate?.gamma),
});

export const getScreenAngle = () => {
  const screenAngle = window.screen?.orientation?.angle;
  const legacyAngle = window.orientation;
  return toFiniteNumber(screenAngle ?? legacyAngle) || 0;
};

export const getSearchParams = () => new URLSearchParams(window.location.search);

export const getHashParams = () => {
  const hash = window.location.hash.replace(/^#/, '');
  const queryStart = hash.indexOf('?');

  return new URLSearchParams(queryStart >= 0 ? hash.slice(queryStart + 1) : '');
};

export const getRelayOrigin = () => {
  const relayParam = getSearchParams().get('relay') || getHashParams().get('relay');
  const relayOrigin = normalizeOrigin(relayParam) || getDefaultRelayOrigin();

  return relayOrigin || window.location.origin;
};

export const getPhoneSessionId = () => {
  const pathSession = window.location.pathname.match(/^\/motion-phone\/([^/]+)\/?$/)?.[1];
  const hashSession = window.location.hash.match(/^#\/motion-phone\/([^?/#]+)\/?/)?.[1];
  const params = getSearchParams();
  const hashParams = getHashParams();

  return (
    (pathSession ? decodeURIComponent(pathSession) : '')
    || (hashSession ? decodeURIComponent(hashSession) : '')
    || params.get('s')
    || params.get('session')
    || hashParams.get('s')
    || hashParams.get('session')
    || ''
  );
};

export const createPhoneUrl = (origin, sessionId, relayOrigin) => {
  const phoneUrl = new URL('/', origin);
  const hashParams = new URLSearchParams();

  if (
    normalizeOrigin(relayOrigin)
    && normalizeOrigin(relayOrigin) !== normalizeOrigin(origin)
  ) {
    hashParams.set('relay', normalizeOrigin(relayOrigin));
  }
  const hashQuery = hashParams.toString();
  phoneUrl.hash = `/motion-phone/${encodeURIComponent(sessionId)}${hashQuery ? `?${hashQuery}` : ''}`;
  return phoneUrl.toString();
};

export const formatMetric = (value, digits = 1) => (
  Number.isFinite(value) ? value.toFixed(digits) : '--'
);

export const formatVector = (vector, digits = 2) => (
  `${formatMetric(vector?.x, digits)}, ${formatMetric(vector?.y, digits)}, ${formatMetric(vector?.z, digits)}`
);

export const getPacketOrientation = (packet) => packet?.orientation || {};
export const getPacketMotion = (packet) => packet?.motion || {};

export const hasUsableOrientationPacket = (packet) => {
  const orientation = getPacketOrientation(packet);

  return (
    Number.isFinite(orientation.alpha)
    && Number.isFinite(orientation.beta)
    && Number.isFinite(orientation.gamma)
  );
};

export const getPacketTimestamp = (packet) => {
  const timestamp = packet?.relayReceivedAt ?? packet?.sentAt;
  return Number.isFinite(timestamp) ? timestamp : 0;
};
