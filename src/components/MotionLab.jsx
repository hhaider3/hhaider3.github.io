import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Activity,
  AlertTriangle,
  Compass,
  Gauge,
  Link,
  Play,
  RadioTower,
  RefreshCw,
  Smartphone,
  Square,
  Wifi,
} from 'lucide-react';
import { createQrPath } from '../utils/qrCode';

const publishEndpoint = '/api/motion/publish';
const socketEndpoint = '/api/motion/socket';
const configEndpoint = '/api/motion/config';
const defaultRelayUrl = 'https://motion-lab-relay.onrender.com';
const configuredRelayUrl = import.meta.env.VITE_MOTION_RELAY_URL || defaultRelayUrl;
const targetPublishIntervalMs = 1000 / 30;
const maxSocketBufferedBytes = 256_000;

const createApiUrl = (origin, endpoint) => new URL(endpoint, origin).toString();

const createSocketUrl = (origin, endpoint) => {
  const url = new URL(endpoint, origin);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
};

const normalizeOrigin = (value) => {
  if (!value) {
    return '';
  }

  try {
    return new URL(value, window.location.origin).origin;
  } catch {
    return '';
  }
};

const createSessionId = () => {
  if (window.crypto?.getRandomValues) {
    const values = new Uint8Array(6);
    window.crypto.getRandomValues(values);
    return Array.from(values, value => value.toString(16).padStart(2, '0')).join('');
  }

  return Math.random().toString(36).slice(2, 14);
};

const toFiniteNumber = (value) => (
  Number.isFinite(value) ? Number(value) : null
);

const readVector = (vector) => ({
  x: toFiniteNumber(vector?.x),
  y: toFiniteNumber(vector?.y),
  z: toFiniteNumber(vector?.z),
});

const readRotationRate = (rotationRate) => ({
  alpha: toFiniteNumber(rotationRate?.alpha),
  beta: toFiniteNumber(rotationRate?.beta),
  gamma: toFiniteNumber(rotationRate?.gamma),
});

const getScreenAngle = () => {
  const screenAngle = window.screen?.orientation?.angle;
  const legacyAngle = window.orientation;
  return toFiniteNumber(screenAngle ?? legacyAngle) || 0;
};

const getSearchParams = () => new URLSearchParams(window.location.search);

const getHashParams = () => {
  const hash = window.location.hash.replace(/^#/, '');
  const queryStart = hash.indexOf('?');

  return new URLSearchParams(queryStart >= 0 ? hash.slice(queryStart + 1) : '');
};

const getRelayOrigin = () => {
  const relayParam = getSearchParams().get('relay') || getHashParams().get('relay');
  const relayOrigin = normalizeOrigin(relayParam) || normalizeOrigin(configuredRelayUrl);

  return relayOrigin || window.location.origin;
};

const getPhoneSessionId = () => {
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

const createPhoneUrl = (origin, sessionId, relayOrigin) => {
  const phoneUrl = new URL('/', origin);
  const hashParams = new URLSearchParams();

  const relayIsConfiguredAtBuild = (
    normalizeOrigin(configuredRelayUrl)
    && normalizeOrigin(configuredRelayUrl) === normalizeOrigin(relayOrigin)
  );

  if (
    !relayIsConfiguredAtBuild
    && normalizeOrigin(relayOrigin)
    && normalizeOrigin(relayOrigin) !== normalizeOrigin(origin)
  ) {
    hashParams.set('relay', normalizeOrigin(relayOrigin));
  }
  const hashQuery = hashParams.toString();
  phoneUrl.hash = `/motion-phone/${encodeURIComponent(sessionId)}${hashQuery ? `?${hashQuery}` : ''}`;
  return phoneUrl.toString();
};

const formatMetric = (value, digits = 1) => (
  Number.isFinite(value) ? value.toFixed(digits) : '--'
);

const formatVector = (vector, digits = 2) => (
  `${formatMetric(vector?.x, digits)}, ${formatMetric(vector?.y, digits)}, ${formatMetric(vector?.z, digits)}`
);

const getPacketOrientation = (packet) => packet?.orientation || {};
const getPacketMotion = (packet) => packet?.motion || {};

const axisOptions = [
  { id: 'long', label: 'Long' },
  { id: 'screen', label: 'Screen' },
  { id: 'side', label: 'Side' },
];

const axisTargets = {
  long: new THREE.Vector3(0, 1, 0),
  screen: new THREE.Vector3(0, 0, 1),
  side: new THREE.Vector3(1, 0, 0),
};

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

const TelemetryTile = ({ label, value, detail, icon }) => (
  <div className="motion-telemetry-tile">
    <span className="motion-tile-icon">{icon}</span>
    <span className="motion-tile-label">{label}</span>
    <strong>{value}</strong>
    {detail && <small>{detail}</small>}
  </div>
);

const setQuaternionFromDevice = (() => {
  const euler = new THREE.Euler();
  const screenTransform = new THREE.Quaternion();
  const zee = new THREE.Vector3(0, 0, 1);
  const deviceFrameFix = new THREE.Quaternion(
    -Math.sqrt(0.5),
    0,
    0,
    Math.sqrt(0.5)
  );

  return (targetQuaternion, packet) => {
    const orientation = getPacketOrientation(packet);

    if (
      !Number.isFinite(orientation.alpha)
      || !Number.isFinite(orientation.beta)
      || !Number.isFinite(orientation.gamma)
    ) {
      return false;
    }

    const alpha = THREE.MathUtils.degToRad(orientation.alpha);
    const beta = THREE.MathUtils.degToRad(orientation.beta);
    const gamma = THREE.MathUtils.degToRad(orientation.gamma);
    const screenAngle = THREE.MathUtils.degToRad(packet?.screen?.angle || 0);

    euler.set(beta, alpha, -gamma, 'YXZ');
    targetQuaternion.setFromEuler(euler);
    targetQuaternion.multiply(deviceFrameFix);
    targetQuaternion.multiply(screenTransform.setFromAxisAngle(zee, -screenAngle));
    return true;
  };
})();

const createTaperedBladeGeometry = ({
  baseZ,
  tipZ,
  baseWidth,
  tipWidth,
  baseThickness,
  tipThickness,
}) => {
  const shoulderZ = tipZ - 0.32;
  const vertices = [
    [-baseWidth, 0, baseZ],
    [0, baseThickness, baseZ],
    [baseWidth, 0, baseZ],
    [0, -baseThickness, baseZ],
    [-tipWidth, 0, shoulderZ],
    [0, tipThickness, shoulderZ],
    [tipWidth, 0, shoulderZ],
    [0, -tipThickness, shoulderZ],
    [0, 0, tipZ],
  ];
  const indices = [];
  const addQuad = (a, b, c, d) => {
    indices.push(a, b, d, b, c, d);
  };

  for (let index = 0; index < 4; index += 1) {
    const next = (index + 1) % 4;
    addQuad(index, next, next + 4, index + 4);
    indices.push(index + 4, next + 4, 8);
  }
  indices.push(0, 1, 2, 0, 2, 3);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices.flat(), 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
};

const PhoneSwordScene = ({ packet, calibrateKey, axisMode, isAxisFlipped }) => {
  const mountRef = useRef(null);
  const packetRef = useRef(packet);
  const axisModeRef = useRef(axisMode);
  const isAxisFlippedRef = useRef(isAxisFlipped);
  const calibrationSignalRef = useRef(0);

  useEffect(() => {
    packetRef.current = packet;
  }, [packet]);

  useEffect(() => {
    axisModeRef.current = axisMode;
  }, [axisMode]);

  useEffect(() => {
    isAxisFlippedRef.current = isAxisFlipped;
  }, [isAxisFlipped]);

  useEffect(() => {
    calibrationSignalRef.current += 1;
  }, [calibrateKey]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return undefined;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x050912, 5, 14);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
    camera.position.set(0, 1.05, 5.4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x050912, 1);
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xbfdfff, 1.4);
    const keyLight = new THREE.PointLight(0x18d7ff, 36, 9);
    keyLight.position.set(2.3, 2.7, 2.8);
    const roseLight = new THREE.PointLight(0xff5ea8, 18, 7);
    roseLight.position.set(-2.7, -0.8, 2.2);
    scene.add(ambient, keyLight, roseLight);

    const geometries = [];
    const materials = [];
    const trackGeometry = (geometry) => {
      geometries.push(geometry);
      return geometry;
    };
    const trackMaterial = (material) => {
      materials.push(material);
      return material;
    };

    const rig = new THREE.Group();
    const sword = new THREE.Group();
    const bladeBaseZ = 0.5;
    const bladeTipZ = 3.08;
    const hiltCenterZ = -0.08;

    const bladeMaterial = trackMaterial(new THREE.MeshPhysicalMaterial({
      color: 0xbffcff,
      metalness: 0.18,
      roughness: 0.16,
      emissive: 0x20e7ff,
      emissiveIntensity: 1.35,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
    }));
    const bladeGlowMaterial = trackMaterial(new THREE.MeshBasicMaterial({
      color: 0x18d7ff,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    const hiltMaterial = trackMaterial(new THREE.MeshPhysicalMaterial({
      color: 0x091220,
      metalness: 0.64,
      roughness: 0.24,
      emissive: 0x072a47,
      emissiveIntensity: 0.48,
      clearcoat: 0.72,
      clearcoatRoughness: 0.2,
    }));
    const guardMaterial = trackMaterial(new THREE.MeshPhysicalMaterial({
      color: 0xffd166,
      metalness: 0.56,
      roughness: 0.2,
      emissive: 0x3b2500,
      emissiveIntensity: 0.22,
      clearcoat: 0.82,
      clearcoatRoughness: 0.18,
    }));
    const accentMaterial = trackMaterial(new THREE.MeshBasicMaterial({
      color: 0x19b8ff,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
    }));
    const hiltGlowMaterial = trackMaterial(new THREE.MeshBasicMaterial({
      color: 0x19b8ff,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    const phoneMaterial = trackMaterial(new THREE.MeshPhysicalMaterial({
      color: 0x07111d,
      metalness: 0.34,
      roughness: 0.3,
      emissive: 0x0d9bd7,
      emissiveIntensity: 0.22,
      clearcoat: 0.9,
      clearcoatRoughness: 0.16,
    }));
    const edgeMaterial = trackMaterial(new THREE.LineBasicMaterial({
      color: 0x7ce8ff,
      transparent: true,
      opacity: 0.82,
    }));

    const bladeGeometry = trackGeometry(createTaperedBladeGeometry({
      baseZ: bladeBaseZ,
      tipZ: bladeTipZ,
      baseWidth: 0.17,
      tipWidth: 0.055,
      baseThickness: 0.045,
      tipThickness: 0.018,
    }));
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);

    const bladeGlow = new THREE.Mesh(
      trackGeometry(createTaperedBladeGeometry({
        baseZ: bladeBaseZ - 0.03,
        tipZ: bladeTipZ + 0.02,
        baseWidth: 0.27,
        tipWidth: 0.095,
        baseThickness: 0.075,
        tipThickness: 0.034,
      })),
      bladeGlowMaterial
    );

    const bladeEdges = new THREE.LineSegments(
      trackGeometry(new THREE.EdgesGeometry(bladeGeometry)),
      edgeMaterial
    );

    const grip = new THREE.Mesh(
      trackGeometry(new THREE.CylinderGeometry(0.065, 0.075, 0.84, 18)),
      hiltMaterial
    );
    grip.rotation.x = Math.PI / 2;
    grip.position.set(0, 0.04, hiltCenterZ);

    const phoneMountGeometry = trackGeometry(new THREE.BoxGeometry(0.3, 0.05, 0.9, 2, 1, 4));
    const phoneMount = new THREE.Mesh(phoneMountGeometry, phoneMaterial);
    phoneMount.position.set(0, -0.105, hiltCenterZ);
    const phoneMountEdges = new THREE.LineSegments(
      trackGeometry(new THREE.EdgesGeometry(phoneMountGeometry)),
      edgeMaterial
    );
    phoneMountEdges.position.copy(phoneMount.position);

    const guard = new THREE.Mesh(
      trackGeometry(new THREE.BoxGeometry(0.9, 0.1, 0.12, 2, 1, 1)),
      guardMaterial
    );
    guard.position.z = bladeBaseZ - 0.08;

    const guardGlow = new THREE.Mesh(
      trackGeometry(new THREE.BoxGeometry(1.06, 0.16, 0.18, 2, 1, 1)),
      hiltGlowMaterial
    );
    guardGlow.position.copy(guard.position);

    const pommel = new THREE.Mesh(
      trackGeometry(new THREE.SphereGeometry(0.115, 24, 12)),
      guardMaterial
    );
    pommel.position.z = -0.62;

    const pivotGlow = new THREE.Mesh(
      trackGeometry(new THREE.SphereGeometry(0.035, 18, 10)),
      accentMaterial
    );
    pivotGlow.position.z = hiltCenterZ;

    [-0.36, 0.16].forEach((zPosition) => {
      const wrap = new THREE.Mesh(
        trackGeometry(new THREE.TorusGeometry(0.095, 0.01, 8, 36)),
        accentMaterial
      );
      wrap.position.z = zPosition;
      sword.add(wrap);
    });

    const guardCapGeometry = trackGeometry(new THREE.SphereGeometry(0.06, 18, 10));
    [-0.49, 0.49].forEach((xPosition) => {
      const cap = new THREE.Mesh(guardCapGeometry, accentMaterial);
      cap.position.set(xPosition, 0, bladeBaseZ - 0.08);
      sword.add(cap);
    });

    sword.add(
      bladeGlow,
      blade,
      bladeEdges,
      guardGlow,
      guard,
      grip,
      phoneMount,
      phoneMountEdges,
      pommel,
      pivotGlow
    );
    rig.add(sword);
    scene.add(rig);

    const grid = new THREE.GridHelper(7, 14, 0x1fd6ff, 0x16314a);
    grid.position.y = -1.32;
    grid.material.transparent = true;
    grid.material.opacity = 0.32;
    scene.add(grid);

    const ringGroup = new THREE.Group();
    [1.2, 1.9, 2.6].forEach((radius, index) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.006, 8, 96),
        new THREE.MeshBasicMaterial({
          color: index === 1 ? 0xffd166 : 0x19b8ff,
          transparent: true,
          opacity: 0.22,
          blending: THREE.AdditiveBlending,
        })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -1.3 + index * 0.18;
      ringGroup.add(ring);
    });
    scene.add(ringGroup);

    const rawQuaternion = new THREE.Quaternion();
    const targetQuaternion = new THREE.Quaternion();
    const baselineInverse = new THREE.Quaternion();
    const baseSwordAxis = new THREE.Vector3(0, 0, 1);
    const targetSwordAxis = new THREE.Vector3();
    const targetPosition = new THREE.Vector3();
    const currentPosition = new THREE.Vector3();
    let hasBaseline = false;
    let lastCalibrationSignal = calibrationSignalRef.current;
    let lastAxisMode = '';
    let lastAxisFlipped = null;
    let animationFrame = 0;
    let lastTime = performance.now();

    const resize = () => {
      const { clientWidth, clientHeight } = mount;
      const width = Math.max(1, clientWidth);
      const height = Math.max(1, clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const animate = (time) => {
      const delta = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;
      const currentPacket = packetRef.current;
      const hasOrientation = setQuaternionFromDevice(rawQuaternion, currentPacket);
      const nextAxisMode = axisModeRef.current;
      const nextAxisFlipped = isAxisFlippedRef.current;

      if (nextAxisMode !== lastAxisMode || nextAxisFlipped !== lastAxisFlipped) {
        lastAxisMode = nextAxisMode;
        lastAxisFlipped = nextAxisFlipped;
        targetSwordAxis.copy(axisTargets[nextAxisMode] || axisTargets.long);
        if (nextAxisFlipped) {
          targetSwordAxis.multiplyScalar(-1);
        }
        sword.quaternion.setFromUnitVectors(baseSwordAxis, targetSwordAxis.normalize());
      }

      if (calibrationSignalRef.current !== lastCalibrationSignal) {
        lastCalibrationSignal = calibrationSignalRef.current;
        if (hasOrientation) {
          baselineInverse.copy(rawQuaternion).invert();
          hasBaseline = true;
        }
      }

      if (hasOrientation) {
        if (hasBaseline) {
          targetQuaternion.copy(baselineInverse).multiply(rawQuaternion);
        } else {
          targetQuaternion.copy(rawQuaternion);
        }
        rig.quaternion.slerp(targetQuaternion, 0.26);
      } else {
        rig.rotation.y += delta * 0.45;
        rig.rotation.x = Math.sin(time / 1200) * 0.16;
      }

      const acceleration = getPacketMotion(currentPacket).acceleration || {};
      targetPosition.set(
        THREE.MathUtils.clamp((acceleration.x || 0) * 0.045, -0.65, 0.65),
        THREE.MathUtils.clamp((acceleration.y || 0) * 0.045, -0.42, 0.42),
        THREE.MathUtils.clamp((acceleration.z || 0) * 0.035, -0.48, 0.48)
      );
      currentPosition.lerp(targetPosition, 0.16);
      rig.position.copy(currentPosition);

      const glowPulse = 1 + Math.sin(time / 180) * 0.018;
      bladeGlow.scale.set(glowPulse, glowPulse, 1);
      guardGlow.scale.set(1, 1 + Math.sin(time / 220) * 0.025, 1);
      pivotGlow.scale.setScalar(1 + Math.sin(time / 150) * 0.18);
      ringGroup.rotation.z += delta * 0.15;
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      mount.removeChild(renderer.domElement);
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      grid.geometry.dispose();
      grid.material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div className="motion-scene" ref={mountRef} aria-label="Live phone orientation scene" />;
};

export const PhoneSensorClient = () => {
  const sessionId = getPhoneSessionId();
  const relayOrigin = useMemo(() => getRelayOrigin(), []);
  const latestPacketRef = useRef(null);
  const seenRef = useRef({ motion: false, orientation: false });
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState(sessionId ? 'idle' : 'missing-session');
  const [statusDetail, setStatusDetail] = useState('');
  const [relayCheck, setRelayCheck] = useState('checking');
  const [sentCount, setSentCount] = useState(0);
  const [listenerCount, setListenerCount] = useState(0);
  const [seen, setSeen] = useState({ motion: false, orientation: false });
  const [preview, setPreview] = useState(() => buildEmptyPacket(sessionId));

  useEffect(() => {
    latestPacketRef.current = preview;
  }, [preview]);

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

    let animationFrame = 0;
    let fallbackTimer = 0;
    let lastSend = 0;
    let lastSentUiUpdate = 0;
    let requestInFlight = false;
    let socket = null;
    let socketReady = false;
    let useHttpFallback = false;
    let stopped = false;
    let sentSinceUiUpdate = 0;

    const updateMotion = (event) => {
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

    const updateSocketStats = (message) => {
      try {
        const payload = JSON.parse(message.data);

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

    const sendHttpPacket = async (time) => {
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
        notePacketSent(time);

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
      socket.addEventListener('message', updateSocketStats);
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

    const tick = (time) => {
      if (time - lastSend >= targetPublishIntervalMs) {
        lastSend = time;

        if (!sendSocketPacket(time) && useHttpFallback) {
          sendHttpPacket(time);
        }
      }

      animationFrame = requestAnimationFrame(tick);
    };

    window.addEventListener('devicemotion', updateMotion);
    window.addEventListener('deviceorientation', updateOrientation);
    animationFrame = requestAnimationFrame(tick);

    return () => {
      flushSentCount();
      stopped = true;
      window.clearTimeout(fallbackTimer);
      cancelAnimationFrame(animationFrame);
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
          <Smartphone size={42} />
          <h1>Phone Sender</h1>
          <p>{sessionId ? `Motion Lab session ${sessionId.toUpperCase()}` : 'No session'}</p>
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
            label="Packets"
            value={sentCount}
            detail={`${listenerCount} listener${listenerCount === 1 ? '' : 's'}`}
            icon={<RadioTower size={16} />}
          />
          <TelemetryTile
            label="Orientation"
            value={seen.orientation ? 'On' : '--'}
            detail={`${formatMetric(orientation.alpha)} / ${formatMetric(orientation.beta)} / ${formatMetric(orientation.gamma)}`}
            icon={<Compass size={16} />}
          />
          <TelemetryTile
            label="Motion"
            value={seen.motion ? 'On' : '--'}
            detail={formatVector(acceleration)}
            icon={<Activity size={16} />}
          />
        </div>
      </section>
    </main>
  );
};

const MotionLab = () => {
  const relayOrigin = useMemo(() => getRelayOrigin(), []);
  const [sessionId, setSessionId] = useState(createSessionId);
  const [config, setConfig] = useState(null);
  const [relayStatus, setRelayStatus] = useState('connecting');
  const [latestPacket, setLatestPacket] = useState(null);
  const [packetCount, setPacketCount] = useState(0);
  const [packetRate, setPacketRate] = useState(0);
  const [calibrateKey, setCalibrateKey] = useState(0);
  const [axisMode, setAxisMode] = useState('long');
  const [isAxisFlipped, setIsAxisFlipped] = useState(false);
  const [isStreamExpanded, setIsStreamExpanded] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const arrivalTimesRef = useRef([]);

  useEffect(() => {
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
  }, [relayOrigin]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!config || config.relayAvailable === false) {
      return undefined;
    }

    const eventSource = new EventSource(createApiUrl(
      relayOrigin,
      `/api/motion/events?s=${encodeURIComponent(sessionId)}`
    ));

    eventSource.onopen = () => setRelayStatus('ready');
    eventSource.onerror = () => setRelayStatus('reconnecting');
    eventSource.addEventListener('hello', () => setRelayStatus('ready'));
    eventSource.addEventListener('sensor', (event) => {
      const packet = JSON.parse(event.data);
      const arrival = performance.now();
      arrivalTimesRef.current = [...arrivalTimesRef.current, arrival].filter(item => arrival - item <= 1000);
      setPacketRate(arrivalTimesRef.current.length);
      setLatestPacket(packet);
      setPacketCount(count => count + 1);
      setRelayStatus('live');
    });

    return () => eventSource.close();
  }, [config, relayOrigin, sessionId]);

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
  const showPairPanel = !isLive;
  const labClassName = [
    'motion-lab',
    showPairPanel ? '' : 'pair-hidden',
    isStreamExpanded ? 'stream-expanded' : 'stream-collapsed',
  ].filter(Boolean).join(' ');

  const resetSession = () => {
    setRelayStatus('connecting');
    setSessionId(createSessionId());
    setLatestPacket(null);
    setPacketCount(0);
    setPacketRate(0);
    setIsStreamExpanded(false);
    arrivalTimesRef.current = [];
  };

  return (
    <section className={labClassName}>
      {showPairPanel && (
        <div className="motion-host-panel motion-pair-panel">
          <div className="motion-panel-heading">
            <span className="motion-heading-icon"><Smartphone size={20} /></span>
            <div>
              <h2>Motion Lab</h2>
              <p>Session {sessionId.toUpperCase()}</p>
            </div>
          </div>

          <QrCode value={phoneUrl} />

          <div className="motion-url-box">
            <Link size={15} />
            <a href={phoneUrl} target="_blank" rel="noreferrer">{phoneUrl}</a>
          </div>

          <div className="motion-axis-control" aria-label="Sword hilt phone axis">
            {axisOptions.map(option => (
              <button
                key={option.id}
                type="button"
                className={axisMode === option.id ? 'active' : ''}
                onClick={() => setAxisMode(option.id)}
              >
                {option.label}
              </button>
            ))}
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
            <button type="button" className="motion-secondary-button" onClick={() => setIsAxisFlipped(flipped => !flipped)}>
              <RefreshCw size={16} />
              Flip tip
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
      )}

      <div className="motion-viewport-panel">
        <PhoneSwordScene
          packet={latestPacket}
          calibrateKey={calibrateKey}
          axisMode={axisMode}
          isAxisFlipped={isAxisFlipped}
        />
        <div className="motion-scene-overlay">
          <div className="motion-live-status">
            <span className={`motion-live-dot ${isLive ? 'live' : ''}`} />
            <strong>{isLive ? 'Live' : relayStatus === 'unavailable' ? 'No relay' : relayStatus === 'reconnecting' ? 'Waiting' : 'Ready'}</strong>
            <small>{Number.isFinite(packetAge) ? `${Math.round(packetAge)} ms ago` : relayStatus}</small>
          </div>
          <div className="motion-scene-actions">
            <button
              type="button"
              className={`motion-overlay-button ${isStreamExpanded ? 'active' : ''}`}
              onClick={() => setIsStreamExpanded(expanded => !expanded)}
              aria-controls="motion-sensor-stream"
              aria-expanded={isStreamExpanded}
            >
              <Gauge size={15} />
              {isStreamExpanded ? 'Hide stream' : 'Show stream'}
            </button>
            <div className="motion-scene-readout">
              <span>Hz {packetRate}</span>
              <span>Packets {packetCount}</span>
            </div>
          </div>
        </div>
      </div>

      {isStreamExpanded && (
        <div className="motion-host-panel motion-data-panel" id="motion-sensor-stream">
          <div className="motion-panel-heading">
            <span className="motion-heading-icon"><Gauge size={20} /></span>
            <div>
              <h2>Sensor Stream</h2>
              <p>{latestPacket?.seen?.orientation || latestPacket?.seen?.motion ? 'Phone sensors active' : 'No phone packets yet'}</p>
            </div>
          </div>

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
      )}
    </section>
  );
};

export default MotionLab;
