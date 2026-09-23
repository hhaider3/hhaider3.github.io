import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Compass, Gauge, Link, Minus, RadioTower, RefreshCw, Smartphone, Wifi, X } from 'lucide-react';
import { createQrPath } from '../utils/qrCode';
import PhoneSwordScene from './motion/PhoneSwordScene';
import TelemetryTile from './motion/TelemetryTile';
import {
  configEndpoint, createApiUrl, createPhoneUrl, createSessionId, feedbackEndpoint,
  formatMetric, formatVector, getPacketMotion, getPacketOrientation, getRelayOrigin,
} from './motion/protocol';

const phoneViewportQuery = '(max-width: 760px)';

const QrCode = ({ value }) => {
  const qr = useMemo(() => {
    try {
      return createQrPath(value);
    } catch {
      return null;
    }
  }, [value]);

  if (!qr) {
    return (
      <div className="motion-qr-fallback">
        <Link size={22} />
      </div>
    );
  }

  return (
    <svg
      className="motion-qr"
      viewBox={`0 0 ${qr.size} ${qr.size}`}
      role="img"
      aria-label="Phone pairing QR code"
      shapeRendering="crispEdges"
    >
      <rect width={qr.size} height={qr.size} fill="#ffffff" />
      <path d={qr.path} fill="#000000" />
    </svg>
  );
};

const usePhoneViewport = () => {
  const [isPhoneViewport, setIsPhoneViewport] = useState(() => (
    typeof window !== 'undefined' ? window.matchMedia(phoneViewportQuery).matches : false
  ));

  useEffect(() => {
    const mediaQuery = window.matchMedia(phoneViewportQuery);
    const handleChange = (event) => setIsPhoneViewport(event.matches);

    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isPhoneViewport;
};

const MotionLab = () => {
  const isPhoneViewport = usePhoneViewport();
  const relayOrigin = useMemo(() => getRelayOrigin(), []);
  const [sessionId, setSessionId] = useState(createSessionId);
  const [config, setConfig] = useState(null);
  const [relayStatus, setRelayStatus] = useState('connecting');
  const [latestPacket, setLatestPacket] = useState(null);
  const [packetCount, setPacketCount] = useState(0);
  const [packetRate, setPacketRate] = useState(0);
  const [calibrateKey, setCalibrateKey] = useState(0);
  const [isStreamExpanded, setIsStreamExpanded] = useState(false);
  const [isPairPanelExpanded, setIsPairPanelExpanded] = useState(false);
  const [isPairPanelDismissed, setIsPairPanelDismissed] = useState(false);
  const [blockScore, setBlockScore] = useState({ hits: 0, misses: 0 });
  const [now, setNow] = useState(() => Date.now());
  const packetRef = useRef(null);
  const packetCountRef = useRef(0);
  const arrivalTimesRef = useRef([]);

  useEffect(() => {
    if (isPhoneViewport) {
      return undefined;
    }

    let ignore = false;

    fetch(createApiUrl(relayOrigin, configEndpoint))
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Relay config unavailable')))
      .then(payload => {
        if (!ignore) {
          setConfig({ ...payload, relayAvailable: true });
        }
      })
      .catch(() => {
        if (!ignore) {
          setRelayStatus('unavailable');
          setConfig({
            preferredOrigin: window.location.origin,
            localOrigin: window.location.origin,
            lanOrigins: [],
            relayAvailable: false,
            secure: window.isSecureContext,
          });
        }
      });

    return () => {
      ignore = true;
    };
  }, [isPhoneViewport, relayOrigin]);

  useEffect(() => {
    if (isPhoneViewport) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      const cutoff = performance.now() - 1000;
      const arrivals = arrivalTimesRef.current;
      let expired = 0;
      while (expired < arrivals.length && arrivals[expired] < cutoff) expired += 1;
      arrivals.splice(0, expired);
      setLatestPacket(packetRef.current);
      setPacketCount(packetCountRef.current);
      setPacketRate(arrivals.length);
      setNow(Date.now());
    }, isStreamExpanded ? 100 : 250);
    return () => window.clearInterval(interval);
  }, [isPhoneViewport, isStreamExpanded]);

  useEffect(() => {
    if (isPhoneViewport) {
      return undefined;
    }

    if (!config || config.relayAvailable === false) {
      return undefined;
    }

    const eventSource = new EventSource(createApiUrl(
      relayOrigin,
      `/api/motion/events?s=${encodeURIComponent(sessionId)}`
    ));

    let live = false;
    const updateStatus = (status) => {
      live = false;
      setRelayStatus(status);
    };
    eventSource.onopen = () => updateStatus('ready');
    eventSource.onerror = () => updateStatus('reconnecting');
    eventSource.addEventListener('hello', () => updateStatus('ready'));
    eventSource.addEventListener('sensor', (event) => {
      const packet = JSON.parse(event.data);
      const arrival = performance.now();
      arrivalTimesRef.current.push(arrival);
      packetRef.current = packet;
      packetCountRef.current += 1;
      if (!live) {
        live = true;
        setRelayStatus('live');
      }
    });

    return () => eventSource.close();
  }, [config, isPhoneViewport, relayOrigin, sessionId]);

  const phonePageOrigin = relayOrigin === window.location.origin
    ? (config?.preferredOrigin || window.location.origin)
    : window.location.origin;
  const phoneRelayOrigin = relayOrigin === window.location.origin ? phonePageOrigin : relayOrigin;
  const phoneUrl = useMemo(
    () => createPhoneUrl(phonePageOrigin, sessionId, phoneRelayOrigin),
    [phonePageOrigin, phoneRelayOrigin, sessionId]
  );
  const packetAge = latestPacket?.relayReceivedAt ? now - latestPacket.relayReceivedAt : Infinity;
  const isLive = packetAge < 1600;
  const orientation = getPacketOrientation(latestPacket);
  const motion = getPacketMotion(latestPacket);
  const acceleration = motion.acceleration;
  const accelerationWithGravity = motion.accelerationIncludingGravity;
  const rotationRate = motion.rotationRate;
  const secureOrigin = config?.secure || window.isSecureContext;
  const isRelayAvailable = config?.relayAvailable !== false;
  const resolvedBlockCount = blockScore.hits + blockScore.misses;
  const hitPercentage = resolvedBlockCount > 0
    ? Math.round((blockScore.hits / resolvedBlockCount) * 100)
    : null;
  const showPairPanel = (!isLive && !isPairPanelDismissed) || isPairPanelExpanded;
  const labClassName = [
    'motion-lab',
    showPairPanel ? '' : 'pair-hidden',
    isStreamExpanded ? 'stream-expanded' : 'stream-collapsed',
  ].filter(Boolean).join(' ');

  const resetSession = () => {
    setRelayStatus('connecting');
    setSessionId(createSessionId());
    packetRef.current = null;
    packetCountRef.current = 0;
    setLatestPacket(null);
    setPacketCount(0);
    setPacketRate(0);
    setBlockScore({ hits: 0, misses: 0 });
    setCalibrateKey(key => key + 1);
    setIsStreamExpanded(false);
    setIsPairPanelExpanded(false);
    setIsPairPanelDismissed(false);
    arrivalTimesRef.current = [];
  };

  const hidePairPanel = () => {
    setIsPairPanelExpanded(false);
    setIsPairPanelDismissed(true);
  };

  const showPairPanelFromViewport = () => {
    setIsPairPanelExpanded(true);
    setIsPairPanelDismissed(false);
  };

  const handleBlockScored = useCallback((result, detail = {}) => {
    setBlockScore(score => ({
      hits: score.hits + (result === 'hit' ? 1 : 0),
      misses: score.misses + (result === 'miss' ? 1 : 0),
    }));

    if (result === 'hit' && isRelayAvailable) {
      fetch(createApiUrl(relayOrigin, feedbackEndpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          feedback: 'hit',
          intensity: detail.intensity || 0,
          color: detail.color,
        }),
      }).catch(() => {});
    }
  }, [isRelayAvailable, relayOrigin, sessionId]);

  if (isPhoneViewport) {
    return (
      <section className="motion-lab-phone-message" role="status" aria-live="polite">
        <div className="motion-lab-phone-message-panel">
          <span className="motion-lab-phone-message-icon">
            <Smartphone size={36} />
          </span>
          <h1>Best viewed on larger screens</h1>
          <p>Motion Lab uses a desktop viewport for the 3D scene and pairing controls.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={labClassName}>
      {showPairPanel && (
        <div className="motion-win7-window motion-pair-panel" id="motion-pair-panel">
          <div className="motion-win7-glow" aria-hidden="true" />
          <div className="motion-win7-titlebar">
            <div className="motion-win7-title">
              <span className="motion-win7-favicon accent-blue"><Smartphone size={14} /></span>
              <span>Motion Lab</span>
              <small>Session {sessionId.toUpperCase()}</small>
            </div>
            <div className="motion-win7-controls">
              <button type="button" aria-label="Close Motion Lab pairing panel" onClick={hidePairPanel}>
                <Minus size={14} />
              </button>
            </div>
          </div>
          <div className="motion-win7-body">
            <QrCode value={phoneUrl} />

            <div className="motion-url-box">
              <Link size={15} />
              <a href={phoneUrl} target="_blank" rel="noreferrer">{phoneUrl}</a>
            </div>

            <div className="motion-alignment-note">
              <span>Hold the phone straight and vertical before starting sensors. The first live orientation packet becomes the sword's upright zero.</span>
            </div>

            <div className="motion-pair-actions">
              <button type="button" className="motion-secondary-button" onClick={resetSession}>
                <RefreshCw size={16} />
                New session
              </button>
              <button type="button" className="motion-secondary-button" onClick={() => setCalibrateKey(key => key + 1)}>
                <Compass size={16} />
                Calibrate
              </button>
            </div>

            <div className="motion-context-list">
              <span className={secureOrigin ? 'ok' : 'warn'}>
                {secureOrigin ? 'Trusted origin' : 'HTTPS needed for phone sensors'}
              </span>
              <span>{config?.lanOrigins?.[0] ? 'LAN address detected' : 'Using current origin'}</span>
              <span className={isRelayAvailable ? 'ok' : 'warn'}>
                {isRelayAvailable ? 'Local relay ready' : 'Relay unavailable on static hosting'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="motion-win7-window motion-viewport-panel">
        <div className="motion-win7-glow" aria-hidden="true" />
        <div className="motion-win7-titlebar">
          <div className="motion-win7-title">
            <span className="motion-win7-favicon accent-cyan"><RadioTower size={14} /></span>
            <span>3D Viewport</span>
            <small>{isLive ? 'Live' : relayStatus === 'unavailable' ? 'No relay' : relayStatus === 'reconnecting' ? 'Waiting' : 'Ready'}</small>
          </div>
          {!isStreamExpanded && (
            <div className="motion-win7-controls">
              <button
                type="button"
                className="motion-titlebar-action"
                onClick={() => setIsStreamExpanded(true)}
                aria-controls="motion-sensor-stream"
                aria-expanded={false}
              >
                <Gauge size={13} />
                Show stream
              </button>
            </div>
          )}
        </div>
        <div className="motion-win7-body motion-viewport-body">
          <PhoneSwordScene
            packetRef={packetRef}
            calibrateKey={calibrateKey}
            onBlockScored={handleBlockScored}
          />
          <div className="motion-scene-overlay">
            <div className="motion-scene-left">
              <div className="motion-live-status">
                <span className={`motion-live-dot ${isLive ? 'live' : ''}`} />
                <strong>{isLive ? 'Live' : relayStatus === 'unavailable' ? 'No relay' : relayStatus === 'reconnecting' ? 'Waiting' : 'Ready'}</strong>
                <small>{Number.isFinite(packetAge) ? `${Math.round(packetAge)} ms ago` : relayStatus}</small>
              </div>
              {!showPairPanel && (
                <button
                  type="button"
                  className="motion-overlay-button"
                  onClick={showPairPanelFromViewport}
                  aria-controls="motion-pair-panel"
                  aria-expanded="false"
                >
                  <Smartphone size={15} />
                  Show QR
                </button>
              )}
            </div>
            <div className="motion-scene-actions">
              <div className="motion-scoreboard" aria-label="Cube score">
                <span>
                  <small>Hits</small>
                  <strong>{blockScore.hits}</strong>
                </span>
                <span>
                  <small>Hit %</small>
                  <strong>{hitPercentage === null ? '--' : `${hitPercentage}%`}</strong>
                </span>
              </div>
              <div className="motion-scene-readout">
                <span>Received {packetRate} Hz</span>
                {latestPacket?.stream ? (
                  <>
                    <span>Phone {formatMetric(latestPacket.stream.sendHz, 0)} Hz · {latestPacket.stream.transport}</span>
                    <span>Motion {formatMetric(latestPacket.stream.motionHz, 0)} Hz · Orientation {formatMetric(latestPacket.stream.orientationHz, 0)} Hz</span>
                  </>
                ) : latestPacket && <span>Reload phone for rate details</span>}
                <span>Packets {packetCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isStreamExpanded && (
        <div className="motion-win7-window motion-data-panel" id="motion-sensor-stream">
          <div className="motion-win7-glow" aria-hidden="true" />
          <div className="motion-win7-titlebar">
            <div className="motion-win7-title">
              <span className="motion-win7-favicon accent-violet"><Gauge size={14} /></span>
              <span>Sensor Stream</span>
              <small>{latestPacket?.seen?.orientation || latestPacket?.seen?.motion ? 'Phone sensors active' : 'No phone packets yet'}</small>
            </div>
            <div className="motion-win7-controls">
              <button type="button" aria-label="Close" className="motion-win7-close" onClick={() => setIsStreamExpanded(false)}>
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="motion-win7-body">
            <div className="motion-telemetry-grid">
              <TelemetryTile
                label="Orientation"
                value={`${formatMetric(orientation.alpha)} deg`}
                detail={`beta ${formatMetric(orientation.beta)} / gamma ${formatMetric(orientation.gamma)}`}
                icon={<Compass size={16} />}
              />
              <TelemetryTile
                label="Accel"
                value={formatVector(acceleration)}
                detail="m/s2, linear"
                icon={<Activity size={16} />}
              />
              <TelemetryTile
                label="Gravity"
                value={formatVector(accelerationWithGravity)}
                detail="m/s2, total"
                icon={<Wifi size={16} />}
              />
              <TelemetryTile
                label="Gyro"
                value={`${formatMetric(rotationRate?.alpha)} / ${formatMetric(rotationRate?.beta)} / ${formatMetric(rotationRate?.gamma)}`}
                detail="deg/s alpha beta gamma"
                icon={<RadioTower size={16} />}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MotionLab;
