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
const orientationReconnectGapMs = 1800;

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

const hasUsableOrientationPacket = (packet) => {
  const orientation = getPacketOrientation(packet);

  return (
    Number.isFinite(orientation.alpha)
    && Number.isFinite(orientation.beta)
    && Number.isFinite(orientation.gamma)
  );
};

const getPacketTimestamp = (packet) => {
  const timestamp = packet?.relayReceivedAt ?? packet?.sentAt;
  return Number.isFinite(timestamp) ? timestamp : 0;
};

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

const swordRestPosition = new THREE.Vector3(0, -0.92, 0);
const blockTravelDuration = 2.55;
const blockSpawnIntervalMs = 780;
const maxActiveBlocks = 7;
const slashTrailMinSpeed = 2.15;
const slashCutMinSpeed = 2.85;
const blockCutRadius = 0.42;

const blockLaneConfigs = [
  { id: 'right', color: 0xff2d55, hit: new THREE.Vector3(1.92, 0.22, 0.12) },
  { id: 'top-right', color: 0x2f80ff, hit: new THREE.Vector3(1.26, 1.08, 0.12) },
  { id: 'top', color: 0xa855f7, hit: new THREE.Vector3(0, 1.52, 0.12) },
  { id: 'top-left', color: 0xd946ef, hit: new THREE.Vector3(-1.26, 1.08, 0.12) },
  { id: 'left', color: 0x18f5ff, hit: new THREE.Vector3(-1.92, 0.22, 0.12) },
].map((lane) => ({
  ...lane,
  start: new THREE.Vector3(lane.hit.x * 1.18, lane.hit.y * 1.18 + 0.08, -3.05),
}));

const slashTrailColors = [0x18f5ff, 0xa855f7, 0xff4fd8];

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

    if (!hasUsableOrientationPacket(packet)) {
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

    const laneMarkerGeometry = trackGeometry(new THREE.TorusGeometry(0.34, 0.008, 8, 72));
    const blockCoreGeometry = trackGeometry(new THREE.BoxGeometry(0.58, 0.58, 0.18, 1, 1, 1));
    const blockGlowGeometry = trackGeometry(new THREE.BoxGeometry(0.78, 0.78, 0.08, 1, 1, 1));
    const blockPieceGeometry = trackGeometry(new THREE.BoxGeometry(0.28, 0.58, 0.18, 1, 1, 1));
    const blockCutFaceGeometry = trackGeometry(new THREE.PlaneGeometry(0.065, 0.64));
    const blockEdgeGeometry = trackGeometry(new THREE.EdgesGeometry(blockCoreGeometry));
    const laneMarkerGroup = new THREE.Group();
    const blockGroup = new THREE.Group();
    const trailGroup = new THREE.Group();
    const activeBlocks = [];
    const trailSegments = [];
    const colorWhite = new THREE.Color(0xffffff);
    const bladeBaseWorld = new THREE.Vector3();
    const bladeTipWorld = new THREE.Vector3();
    const previousBladeBase = new THREE.Vector3();
    const previousBladeTip = new THREE.Vector3();
    const slashVector = new THREE.Vector3();
    const segmentVector = new THREE.Vector3();
    const pointVector = new THREE.Vector3();
    const projectedPoint = new THREE.Vector3();
    const slashDirection = new THREE.Vector3();
    const splitNormal = new THREE.Vector3();
    let hasPreviousBlade = false;
    let nextBlockAt = performance.now() + 420;
    let nextLaneIndex = 0;

    blockLaneConfigs.forEach((lane) => {
      const markerMaterial = trackMaterial(new THREE.MeshBasicMaterial({
        color: lane.color,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }));
      const marker = new THREE.Mesh(laneMarkerGeometry, markerMaterial);
      marker.position.copy(lane.hit);
      marker.scale.setScalar(0.82);
      laneMarkerGroup.add(marker);
    });
    scene.add(laneMarkerGroup, blockGroup, trailGroup);

    const tagMaterialOpacity = (material) => {
      material.userData.baseOpacity = material.opacity;
      return material;
    };

    const fadeBlockMaterials = (block, amount) => {
      block.materials.forEach((material) => {
        if (Number.isFinite(material.userData.baseOpacity)) {
          material.opacity = material.userData.baseOpacity * amount;
        }
      });
    };

    const disposeBlock = (block) => {
      blockGroup.remove(block.group);
      block.materials.forEach(material => material.dispose());
      block.group.clear();
    };

    const disposeTrailSegment = (segment) => {
      trailGroup.remove(segment.mesh);
      segment.geometry.dispose();
      segment.material.dispose();
    };

    const removeTrailSegment = (index) => {
      disposeTrailSegment(trailSegments[index]);
      trailSegments.splice(index, 1);
    };

    const getDistanceToSegment = (point, start, end) => {
      segmentVector.copy(end).sub(start);
      const lengthSq = segmentVector.lengthSq();

      if (lengthSq <= 0.0001) {
        return point.distanceTo(start);
      }

      const amount = THREE.MathUtils.clamp(
        pointVector.copy(point).sub(start).dot(segmentVector) / lengthSq,
        0,
        1
      );
      projectedPoint.copy(start).addScaledVector(segmentVector, amount);
      return projectedPoint.distanceTo(point);
    };

    const createBlock = (lane) => {
      const color = new THREE.Color(lane.color);
      const group = new THREE.Group();
      const bodyMaterial = tagMaterialOpacity(new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.26,
        roughness: 0.18,
        emissive: color,
        emissiveIntensity: 1.15,
        transparent: true,
        opacity: 0.92,
        clearcoat: 0.85,
        clearcoatRoughness: 0.12,
      }));
      const glowMaterial = tagMaterialOpacity(new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }));
      const edgeLineMaterial = tagMaterialOpacity(new THREE.LineBasicMaterial({
        color: color.clone().lerp(colorWhite, 0.42),
        transparent: true,
        opacity: 0.86,
      }));
      const glow = new THREE.Mesh(blockGlowGeometry, glowMaterial);
      const body = new THREE.Mesh(blockCoreGeometry, bodyMaterial);
      const edges = new THREE.LineSegments(blockEdgeGeometry, edgeLineMaterial);
      body.rotation.set(Math.random() * 0.55, Math.random() * 0.35, Math.random() * Math.PI);
      edges.rotation.copy(body.rotation);
      group.add(glow, body, edges);
      group.position.copy(lane.start);
      group.scale.setScalar(0.42);
      blockGroup.add(group);

      activeBlocks.push({
        state: 'active',
        lane,
        group,
        body,
        glow,
        edges,
        materials: [bodyMaterial, glowMaterial, edgeLineMaterial],
        progress: 0,
        travelDuration: blockTravelDuration + Math.random() * 0.28,
        wobble: Math.random() * Math.PI * 2,
        spin: new THREE.Vector3(
          0.35 + Math.random() * 0.45,
          0.22 + Math.random() * 0.38,
          0.36 + Math.random() * 0.52
        ),
        cutAge: 0,
        cutLife: 0,
        splitSpeed: 0,
        cutSpin: 0,
        pieces: [],
      });
    };

    const cutBlock = (block, motionVector, intensity) => {
      block.state = 'cut';
      block.cutAge = 0;
      block.cutLife = 0.82 + intensity * 0.24;
      block.splitSpeed = 0.34 + intensity * 0.34;
      block.cutSpin = (Math.random() > 0.5 ? 1 : -1) * (0.4 + intensity * 0.85);
      block.body.visible = false;
      block.glow.visible = false;
      block.edges.visible = false;

      if (motionVector.lengthSq() > 0.0001) {
        slashDirection.copy(motionVector).normalize();
      } else {
        slashDirection.set(1, 0, 0);
      }
      splitNormal.set(-slashDirection.y, slashDirection.x, 0);
      if (splitNormal.lengthSq() <= 0.0001) {
        splitNormal.set(1, 0, 0);
      }
      splitNormal.normalize();
      block.group.rotation.z = Math.atan2(splitNormal.y, splitNormal.x);

      const color = new THREE.Color(block.lane.color);
      const hotColor = color.clone().lerp(colorWhite, 0.54);
      const pieceMaterialA = tagMaterialOpacity(new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.18,
        roughness: 0.14,
        emissive: hotColor,
        emissiveIntensity: 1.65 + intensity * 1.45,
        transparent: true,
        opacity: 0.94,
        clearcoat: 0.8,
      }));
      const pieceMaterialB = pieceMaterialA.clone();
      tagMaterialOpacity(pieceMaterialB);
      const faceMaterialA = tagMaterialOpacity(new THREE.MeshBasicMaterial({
        color: hotColor,
        transparent: true,
        opacity: 0.96,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      }));
      const faceMaterialB = faceMaterialA.clone();
      tagMaterialOpacity(faceMaterialB);
      const pieceA = new THREE.Mesh(blockPieceGeometry, pieceMaterialA);
      const pieceB = new THREE.Mesh(blockPieceGeometry, pieceMaterialB);
      const cutFaceA = new THREE.Mesh(blockCutFaceGeometry, faceMaterialA);
      const cutFaceB = new THREE.Mesh(blockCutFaceGeometry, faceMaterialB);
      pieceA.position.x = -0.15;
      pieceB.position.x = 0.15;
      cutFaceA.position.set(0.16, 0, 0.096);
      cutFaceB.position.set(-0.16, 0, 0.096);
      pieceA.add(cutFaceA);
      pieceB.add(cutFaceB);
      block.group.add(pieceA, pieceB);
      block.pieces = [pieceA, pieceB];
      block.materials.push(pieceMaterialA, pieceMaterialB, faceMaterialA, faceMaterialB);
    };

    const createTrailSegment = (fromBase, fromTip, toBase, toTip, intensity) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute([
        fromBase.x, fromBase.y, fromBase.z,
        fromTip.x, fromTip.y, fromTip.z,
        toTip.x, toTip.y, toTip.z,
        toBase.x, toBase.y, toBase.z,
      ], 3));
      geometry.setIndex([0, 1, 2, 0, 2, 3]);
      geometry.computeVertexNormals();

      const color = slashTrailColors[Math.min(
        slashTrailColors.length - 1,
        Math.floor(intensity * slashTrailColors.length)
      )];
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.18 + intensity * 0.42,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      trailGroup.add(mesh);
      trailSegments.push({
        mesh,
        geometry,
        material,
        age: 0,
        life: 0.26 + intensity * 0.18,
        baseOpacity: material.opacity,
      });

      if (trailSegments.length > 34) {
        removeTrailSegment(0);
      }
    };

    const updateTrailSegments = (delta) => {
      for (let index = trailSegments.length - 1; index >= 0; index -= 1) {
        const segment = trailSegments[index];
        segment.age += delta;
        const amount = THREE.MathUtils.clamp(1 - segment.age / segment.life, 0, 1);
        segment.material.opacity = segment.baseOpacity * amount * amount;

        if (amount <= 0) {
          removeTrailSegment(index);
        }
      }
    };

    const updateActiveBlock = (block, time, delta, canCut, slashSpeed, slashIntensity) => {
      block.progress += delta / block.travelDuration;
      const amount = THREE.MathUtils.clamp(block.progress, 0, 1);
      const eased = 1 - Math.pow(1 - amount, 3);
      block.group.position.lerpVectors(block.lane.start, block.lane.hit, eased);
      block.group.scale.setScalar(0.42 + eased * 0.68 + Math.sin(time / 170 + block.wobble) * 0.018);
      block.body.rotation.x += block.spin.x * delta;
      block.body.rotation.y += block.spin.y * delta;
      block.body.rotation.z += block.spin.z * delta;
      block.edges.rotation.copy(block.body.rotation);
      block.glow.material.opacity = block.glow.material.userData.baseOpacity * (0.78 + Math.sin(time / 130 + block.wobble) * 0.22);

      if (
        canCut
        && slashSpeed > slashCutMinSpeed
        && getDistanceToSegment(block.group.position, bladeBaseWorld, bladeTipWorld) <= blockCutRadius
      ) {
        cutBlock(block, slashVector, slashIntensity);
      }
    };

    const updateCutBlock = (block, delta) => {
      block.cutAge += delta;
      const amount = THREE.MathUtils.clamp(block.cutAge / block.cutLife, 0, 1);
      const eased = 1 - Math.pow(1 - amount, 2);

      if (block.pieces.length === 2) {
        block.pieces[0].position.x = -0.15 - eased * block.splitSpeed;
        block.pieces[1].position.x = 0.15 + eased * block.splitSpeed;
        block.pieces[0].position.y = Math.sin(amount * Math.PI) * 0.08 - eased * eased * 0.18;
        block.pieces[1].position.y = Math.sin(amount * Math.PI) * 0.06 - eased * eased * 0.24;
        block.pieces[0].rotation.z = -eased * 0.72;
        block.pieces[1].rotation.z = eased * 0.72;
      }

      block.group.position.z += delta * 0.28;
      block.group.rotation.z += block.cutSpin * delta;
      fadeBlockMaterials(block, 1 - amount);
    };

    const updateBlocks = (time, delta, canCut, slashSpeed, slashIntensity) => {
      if (time >= nextBlockAt && activeBlocks.length < maxActiveBlocks) {
        createBlock(blockLaneConfigs[nextLaneIndex % blockLaneConfigs.length]);
        nextLaneIndex += 1;
        nextBlockAt = time + blockSpawnIntervalMs * (0.78 + Math.random() * 0.48);
      }

      for (let index = activeBlocks.length - 1; index >= 0; index -= 1) {
        const block = activeBlocks[index];

        if (block.state === 'active') {
          updateActiveBlock(block, time, delta, canCut, slashSpeed, slashIntensity);
        } else {
          updateCutBlock(block, delta);
        }

        if (
          (block.state === 'active' && block.progress > 1.18)
          || (block.state === 'cut' && block.cutAge >= block.cutLife)
        ) {
          disposeBlock(block);
          activeBlocks.splice(index, 1);
        }
      }
    };

    const rawQuaternion = new THREE.Quaternion();
    const targetQuaternion = new THREE.Quaternion();
    const baselineInverse = new THREE.Quaternion();
    const baseSwordAxis = new THREE.Vector3(0, 0, 1);
    const targetSwordAxis = new THREE.Vector3();
    const targetPosition = new THREE.Vector3();
    const currentPosition = new THREE.Vector3();
    let hasBaseline = false;
    let lastCalibrationSignal = calibrationSignalRef.current;
    let lastPacketTimestamp = 0;
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
      const packetTimestamp = getPacketTimestamp(currentPacket);
      let shouldSnapToBaseline = false;

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
        hasBaseline = false;
      }

      if (
        hasOrientation
        && packetTimestamp > 0
        && lastPacketTimestamp > 0
        && packetTimestamp - lastPacketTimestamp > orientationReconnectGapMs
      ) {
        hasBaseline = false;
      }

      if (packetTimestamp > lastPacketTimestamp) {
        lastPacketTimestamp = packetTimestamp;
      }

      if (hasOrientation) {
        if (!hasBaseline) {
          baselineInverse.copy(rawQuaternion).invert();
          hasBaseline = true;
          shouldSnapToBaseline = true;
        }

        targetQuaternion.copy(baselineInverse).multiply(rawQuaternion);

        if (shouldSnapToBaseline) {
          rig.quaternion.copy(targetQuaternion);
        } else {
          rig.quaternion.slerp(targetQuaternion, 0.26);
        }
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
      rig.position.copy(swordRestPosition).add(currentPosition);

      bladeBaseWorld.set(0, 0, bladeBaseZ);
      bladeTipWorld.set(0, 0, bladeTipZ);
      sword.localToWorld(bladeBaseWorld);
      sword.localToWorld(bladeTipWorld);

      const rotationRate = getPacketMotion(currentPacket).rotationRate || {};
      const gyroSpeed = Math.hypot(
        Number.isFinite(rotationRate.alpha) ? rotationRate.alpha : 0,
        Number.isFinite(rotationRate.beta) ? rotationRate.beta : 0,
        Number.isFinite(rotationRate.gamma) ? rotationRate.gamma : 0
      );
      let slashSpeed = 0;
      let slashIntensity = 0;
      let canCut = false;

      if (hasOrientation && !shouldSnapToBaseline) {
        if (hasPreviousBlade && delta > 0) {
          slashVector.copy(bladeTipWorld).sub(previousBladeTip);
          slashSpeed = (slashVector.length() / delta) + gyroSpeed * 0.006;
          slashIntensity = THREE.MathUtils.clamp((slashSpeed - slashTrailMinSpeed) / 6.8, 0, 1);
          canCut = slashSpeed > slashCutMinSpeed;

          if (slashIntensity > 0.03) {
            createTrailSegment(previousBladeBase, previousBladeTip, bladeBaseWorld, bladeTipWorld, slashIntensity);
          }
        }

        previousBladeBase.copy(bladeBaseWorld);
        previousBladeTip.copy(bladeTipWorld);
        hasPreviousBlade = true;
      } else {
        slashVector.set(0, 0, 0);
        hasPreviousBlade = false;
      }

      updateTrailSegments(delta);
      updateBlocks(time, delta, canCut, slashSpeed, slashIntensity);

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
      while (activeBlocks.length > 0) {
        disposeBlock(activeBlocks.pop());
      }
      while (trailSegments.length > 0) {
        disposeTrailSegment(trailSegments.pop());
      }
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
          <div className="motion-phone-upright" aria-hidden="true">
            <span />
            <Smartphone size={52} />
          </div>
          <h1>Hold your phone like this</h1>
          <p>Straight and vertical, top edge up. Start sensors in this pose so the sword begins upright.</p>
          <small>{sessionId ? `Motion Lab session ${sessionId.toUpperCase()}` : 'No session'}</small>
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
  const [isPairPanelExpanded, setIsPairPanelExpanded] = useState(false);
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
  const showPairPanel = !isLive || isPairPanelExpanded;
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
    setCalibrateKey(key => key + 1);
    setIsStreamExpanded(false);
    setIsPairPanelExpanded(false);
    arrivalTimesRef.current = [];
  };

  return (
    <section className={labClassName}>
      {showPairPanel && (
        <div className="motion-host-panel motion-pair-panel" id="motion-pair-panel">
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

          <div className="motion-alignment-note">
            <Smartphone size={16} />
            <span>Hold the phone straight and vertical before starting sensors. The first live orientation packet becomes the sword's upright zero.</span>
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
            {isLive && (
              <button
                type="button"
                className={`motion-overlay-button ${isPairPanelExpanded ? 'active' : ''}`}
                onClick={() => setIsPairPanelExpanded(expanded => !expanded)}
                aria-controls="motion-pair-panel"
                aria-expanded={showPairPanel}
              >
                <Smartphone size={15} />
                {isPairPanelExpanded ? 'Hide QR' : 'Show QR'}
              </button>
            )}
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
