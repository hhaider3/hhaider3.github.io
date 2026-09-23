import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, AlertTriangle, Compass, Play, RadioTower, Smartphone, Square } from 'lucide-react';
import TelemetryTile from './TelemetryTile';
import {
  configEndpoint, createApiUrl, createSocketUrl, formatMetric, formatVector,
  getPacketMotion, getPacketOrientation, getPhoneSessionId, getRelayOrigin,
  getScreenAngle, publishEndpoint, readRotationRate, readVector, socketEndpoint,
  toFiniteNumber,
} from './protocol';

const targetPublishHz = 60;
const targetPublishIntervalMs = 1000 / targetPublishHz;
const maxSocketBufferedBytes = 256_000;

const requestSensorPermission = async () => {
  const requests = [];

  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    requests.push(['motion', DeviceMotionEvent.requestPermission()]);
  }

  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    requests.push(['orientation', DeviceOrientationEvent.requestPermission()]);
  }

  const denied = [];
  for (const [name, request] of requests) {
    const result = await request;
    if (result !== 'granted') {
      denied.push(name);
    }
  }

  if (denied.length > 0) {
    throw new Error(`Sensor permission denied: ${denied.join(', ')}`);
  }
};

const buildEmptyPacket = (sessionId) => ({
  sessionId,
  sentAt: Date.now(),
  performanceTime: performance.now(),
  secureContext: window.isSecureContext,
  orientation: {
    alpha: null,
    beta: null,
    gamma: null,
    absolute: null,
    compassHeading: null,
  },
  motion: {
    acceleration: readVector(),
    accelerationIncludingGravity: readVector(),
    rotationRate: readRotationRate(),
    interval: null,
  },
  screen: {
    angle: getScreenAngle(),
    width: window.innerWidth,
    height: window.innerHeight,
  },
});

const PhoneSensorClient = () => {
  const sessionId = getPhoneSessionId();
  const relayOrigin = useMemo(() => getRelayOrigin(), []);
  const seenRef = useRef({ motion: false, orientation: false });
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState(sessionId ? 'idle' : 'missing-session');
  const [statusDetail, setStatusDetail] = useState('');
  const [relayCheck, setRelayCheck] = useState('checking');
  const [sentCount, setSentCount] = useState(0);
  const [listenerCount, setListenerCount] = useState(0);
  const [seen, setSeen] = useState({ motion: false, orientation: false });
  const [preview, setPreview] = useState(() => buildEmptyPacket(sessionId));
  const latestPacketRef = useRef(preview);

  const markSeen = useCallback((kind) => {
    if (seenRef.current[kind]) {
      return;
    }

    seenRef.current = { ...seenRef.current, [kind]: true };
    setSeen(seenRef.current);
  }, []);

  useEffect(() => {
    let ignore = false;

    fetch(createApiUrl(relayOrigin, configEndpoint))
      .then(response => response.ok ? response.json() : Promise.reject(new Error(`Relay returned ${response.status}`)))
      .then(() => {
        if (!ignore) {
          setRelayCheck('ready');
        }
      })
      .catch(() => {
        if (!ignore) {
          setRelayCheck('unavailable');
        }
      });

    return () => {
      ignore = true;
    };
  }, [relayOrigin]);

  const startSensors = async () => {
    if (!sessionId || isStreaming) {
      return;
    }

    if (relayCheck !== 'ready') {
      setStatus('relay-error');
      setStatusDetail(`No live relay is reachable at ${relayOrigin}.`);
      return;
    }

    try {
      setStatus('requesting');
      setStatusDetail('');
      await requestSensorPermission();
      setIsStreaming(true);
      setStatus('streaming');
    } catch (error) {
      setStatus('blocked');
      setStatusDetail(error.message);
    }
  };

  const stopSensors = () => {
    setIsStreaming(false);
    setStatus('idle');
    setStatusDetail('');
  };

  useEffect(() => {
    if (!isStreaming || !sessionId) {
      return undefined;
    }

    let publishTimer = 0;
    let nextPublishAt = performance.now() + targetPublishIntervalMs;
    let fallbackTimer = 0;
    let lastSentUiUpdate = 0;
    let requestInFlight = false;
    let socket = null;
    let socketReady = false;
    let useHttpFallback = false;
    let stopped = false;
    let sentSinceUiUpdate = 0;
    let rateStartedAt = performance.now();
    const rateCounts = { sent: 0, motion: 0, orientation: 0 };
    let rates = { sendHz: null, motionHz: null, orientationHz: null };

    const readStream = () => ({
      ...rates,
      targetHz: targetPublishHz,
      transport: socketReady ? 'WebSocket' : useHttpFallback ? 'HTTP fallback' : 'Connecting',
    });

    const updateRates = (time) => {
      const elapsed = time - rateStartedAt;
      if (elapsed < 1000) return;
      rates = {
        sendHz: rateCounts.sent * 1000 / elapsed,
        motionHz: rateCounts.motion * 1000 / elapsed,
        orientationHz: rateCounts.orientation * 1000 / elapsed,
      };
      rateCounts.sent = 0;
      rateCounts.motion = 0;
      rateCounts.orientation = 0;
      rateStartedAt = time;
      latestPacketRef.current = { ...latestPacketRef.current, stream: readStream() };
    };

    const updateMotion = (event) => {
      if ([
        event.acceleration?.x, event.acceleration?.y, event.acceleration?.z,
        event.accelerationIncludingGravity?.x, event.accelerationIncludingGravity?.y, event.accelerationIncludingGravity?.z,
        event.rotationRate?.alpha, event.rotationRate?.beta, event.rotationRate?.gamma,
      ].some(Number.isFinite)) {
        rateCounts.motion += 1;
      }
      latestPacketRef.current = {
        ...(latestPacketRef.current || buildEmptyPacket(sessionId)),
        motion: {
          acceleration: readVector(event.acceleration),
          accelerationIncludingGravity: readVector(event.accelerationIncludingGravity),
          rotationRate: readRotationRate(event.rotationRate),
          interval: toFiniteNumber(event.interval),
        },
      };
      markSeen('motion');
    };

    const updateOrientation = (event) => {
      if ([event.alpha, event.beta, event.gamma].some(Number.isFinite)) {
        rateCounts.orientation += 1;
      }
      latestPacketRef.current = {
        ...(latestPacketRef.current || buildEmptyPacket(sessionId)),
        orientation: {
          alpha: toFiniteNumber(event.alpha),
          beta: toFiniteNumber(event.beta),
          gamma: toFiniteNumber(event.gamma),
          absolute: typeof event.absolute === 'boolean' ? event.absolute : null,
          compassHeading: toFiniteNumber(event.webkitCompassHeading),
        },
      };
      markSeen('orientation');
    };

    const buildPacket = () => {
      const packet = {
        ...(latestPacketRef.current || buildEmptyPacket(sessionId)),
        sessionId,
        sentAt: Date.now(),
        performanceTime: performance.now(),
        secureContext: window.isSecureContext,
        seen: seenRef.current,
        stream: readStream(),
        screen: {
          angle: getScreenAngle(),
          width: window.innerWidth,
          height: window.innerHeight,
        },
        userAgent: navigator.userAgent,
      };
      latestPacketRef.current = packet;
      return packet;
    };

    const notePacketSent = (time) => {
      rateCounts.sent += 1;
      sentSinceUiUpdate += 1;

      if (time - lastSentUiUpdate < 250) {
        return;
      }

      const increment = sentSinceUiUpdate;
      sentSinceUiUpdate = 0;
      lastSentUiUpdate = time;

      if (!stopped) {
        setSentCount(count => count + increment);
      }
    };

    const flushSentCount = () => {
      if (sentSinceUiUpdate <= 0 || stopped) {
        return;
      }

      const increment = sentSinceUiUpdate;
      sentSinceUiUpdate = 0;
      setSentCount(count => count + increment);
    };

    const handleSocketMessage = (message) => {
      try {
        const payload = JSON.parse(message.data);

        if (payload.type === 'feedback' && payload.feedback === 'hit') {
          const intensity = Math.max(0, Math.min(1, Number(payload.intensity) || 0));
          navigator.vibrate?.([
            Math.round(18 + intensity * 24),
            18,
            Math.round(10 + intensity * 12),
          ]);
          return;
        }

        if (!Number.isFinite(payload.listeners)) {
          return;
        }

        if (!stopped) {
          setListenerCount(payload.listeners);
        }
      } catch (error) {
        console.warn('Motion socket stats were not valid JSON.', error);
      }
    };

    const sendHttpPacket = async () => {
      if (requestInFlight) {
        return;
      }

      const packet = buildPacket();
      requestInFlight = true;

      try {
        const response = await fetch(createApiUrl(relayOrigin, publishEndpoint), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(packet),
        });

        if (!response.ok) {
          throw new Error(`Relay returned ${response.status}`);
        }

        const result = await response.json();
        notePacketSent(performance.now());

        if (!stopped) {
          setStatus('streaming');
          setListenerCount(result.listeners || 0);
        }
      } catch (error) {
        if (!stopped && useHttpFallback) {
          setStatus('relay-error');
          setStatusDetail(error.message);
        }
      } finally {
        requestInFlight = false;
      }
    };

    const sendSocketPacket = (time) => {
      if (!socketReady || socket?.readyState !== WebSocket.OPEN) {
        return false;
      }

      if (socket.bufferedAmount > maxSocketBufferedBytes) {
        return false;
      }

      socket.send(JSON.stringify(buildPacket()));
      notePacketSent(time);
      return true;
    };

    try {
      socket = new WebSocket(createSocketUrl(
        relayOrigin,
        `${socketEndpoint}?s=${encodeURIComponent(sessionId)}`
      ));

      socket.addEventListener('open', () => {
        socketReady = true;
        useHttpFallback = false;

        if (!stopped) {
          setStatus('streaming');
          setStatusDetail('');
        }
      });
      socket.addEventListener('message', handleSocketMessage);
      socket.addEventListener('error', () => {
        socketReady = false;
        useHttpFallback = true;
      });
      socket.addEventListener('close', () => {
        socketReady = false;
        useHttpFallback = true;

        if (!stopped) {
          setStatusDetail('Fast stream disconnected; using HTTP fallback.');
        }
      });
    } catch (error) {
      useHttpFallback = true;
      console.warn('Motion socket could not start; using HTTP fallback.', error);
    }

    fallbackTimer = window.setTimeout(() => {
      if (!socketReady) {
        useHttpFallback = true;
      }
    }, 1500);

    const publish = () => {
      const time = performance.now();
      updateRates(time);
      if (!sendSocketPacket(time) && useHttpFallback) {
        sendHttpPacket();
      }

      nextPublishAt += targetPublishIntervalMs;
      if (nextPublishAt <= time) {
        nextPublishAt = time + targetPublishIntervalMs;
      }
      publishTimer = window.setTimeout(
        publish,
        Math.max(1, Math.ceil(nextPublishAt - performance.now()))
      );
    };

    window.addEventListener('devicemotion', updateMotion);
    window.addEventListener('deviceorientation', updateOrientation);
    publishTimer = window.setTimeout(publish, Math.ceil(targetPublishIntervalMs));

    return () => {
      flushSentCount();
      stopped = true;
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(publishTimer);
      socket?.close();
      window.removeEventListener('devicemotion', updateMotion);
      window.removeEventListener('deviceorientation', updateOrientation);
    };
  }, [isStreaming, markSeen, relayOrigin, sessionId]);

  useEffect(() => {
    if (!isStreaming) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setPreview(latestPacketRef.current);
    }, 180);

    return () => window.clearInterval(interval);
  }, [isStreaming]);

  const orientation = getPacketOrientation(preview);
  const acceleration = getPacketMotion(preview).acceleration;
  const hasSensorSupport = typeof DeviceMotionEvent !== 'undefined' || typeof DeviceOrientationEvent !== 'undefined';
  const relayUnavailable = relayCheck === 'unavailable';

  return (
    <main className="motion-phone-page">
      <section className="motion-phone-shell">
        <div className="motion-phone-status">
          <span className={`motion-live-dot ${isStreaming ? 'live' : ''}`} />
          <span>{status === 'streaming' ? 'Streaming' : status === 'requesting' ? 'Requesting' : 'Paused'}</span>
        </div>

        <div className="motion-phone-hero">
          <div className="motion-phone-upright" aria-hidden="true">
            <span />
            <Smartphone size={52} />
          </div>
          <h1>Hold your phone like this</h1>
          <p>Straight and vertical, top edge up. Start sensors in this pose so the sword begins upright.</p>
          <small>{sessionId ? `Motion Lab session ${sessionId.toUpperCase()}` : 'No session'}</small>
          <small>Target: {targetPublishHz} Hz</small>
        </div>

        {!window.isSecureContext && (
          <div className="motion-phone-alert">
            <AlertTriangle size={18} />
            <span>Trusted HTTPS is required by many phone browsers for motion sensors.</span>
          </div>
        )}

        {!hasSensorSupport && (
          <div className="motion-phone-alert">
            <AlertTriangle size={18} />
            <span>This browser does not expose motion or orientation events.</span>
          </div>
        )}

        {relayUnavailable && (
          <div className="motion-phone-alert">
            <AlertTriangle size={18} />
            <span>
              {relayOrigin === window.location.origin
                ? 'This page needs a motion relay before it can send sensor packets.'
                : `Motion relay is not reachable at ${relayOrigin}.`}
            </span>
          </div>
        )}

        {statusDetail && (
          <div className="motion-phone-alert">
            <AlertTriangle size={18} />
            <span>{statusDetail}</span>
          </div>
        )}

        <div className="motion-phone-controls">
          <button
            type="button"
            className="motion-primary-button"
            onClick={startSensors}
            disabled={!sessionId || isStreaming || relayCheck !== 'ready'}
          >
            <Play size={18} />
            {relayCheck === 'checking' ? 'Checking relay' : relayCheck === 'unavailable' ? 'No relay' : 'Start sensors'}
          </button>
          <button
            type="button"
            className="motion-secondary-button"
            onClick={stopSensors}
            disabled={!isStreaming}
          >
            <Square size={16} />
            Stop
          </button>
        </div>

        <div className="motion-phone-grid">
          <TelemetryTile
            label="Sending"
            value={isStreaming ? `${formatMetric(preview.stream?.sendHz, 0)} Hz` : 'Paused'}
            detail={`${sentCount} packets · ${listenerCount} listener${listenerCount === 1 ? '' : 's'}${isStreaming ? ` · ${preview.stream?.transport || 'Connecting'}` : ''}`}
            icon={<RadioTower size={16} />}
          />
          <TelemetryTile
            label="Orientation"
            value={isStreaming && seen.orientation ? `${formatMetric(preview.stream?.orientationHz, 0)} Hz` : '--'}
            detail={`${formatMetric(orientation.alpha)} / ${formatMetric(orientation.beta)} / ${formatMetric(orientation.gamma)}`}
            icon={<Compass size={16} />}
          />
          <TelemetryTile
            label="Motion"
            value={isStreaming && seen.motion ? `${formatMetric(preview.stream?.motionHz, 0)} Hz` : '--'}
            detail={formatVector(acceleration)}
            icon={<Activity size={16} />}
          />
        </div>
      </section>
    </main>
  );
};

export default PhoneSensorClient;
