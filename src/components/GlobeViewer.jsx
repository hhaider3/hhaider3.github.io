import { useEffect, useRef, useState } from 'react';
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  Vector3,
  Raycaster,
  WebGLRenderer
} from 'three';

const starCount = 2400;
const earthRadius = 2;
const boundaryRadius = earthRadius * 1.006;
const maxBoundarySegmentDegrees = 1.5;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Used for boundary line vertices in the boundaryGroup's local space.
// Three.js SphereGeometry UV maps lon=L to local (cos(lon), 0, -sin(lon)).
// After boundaryGroup.rotation.y = PI this matches the texture's lon=L in world space.
const latLonToVector = (lat, lon) => {
  const latRad = lat * Math.PI / 180;
  const lonRad = lon * Math.PI / 180;
  const cosLat = Math.cos(latRad);

  return new Vector3(
    cosLat * Math.cos(lonRad),
    Math.sin(latRad),
    -cosLat * Math.sin(lonRad)
  ).normalize();
};

// Used for the sun direction shader uniform (world space).
// The earth mesh has rotation.y = PI, so the texture's geographic lon=L has world
// normal (-cos(lon), sin(lat), sin(lon)). The sun direction must match that frame.
const latLonToSunDirection = (lat, lon) => {
  const latRad = lat * Math.PI / 180;
  const lonRad = lon * Math.PI / 180;
  const cosLat = Math.cos(latRad);

  return new Vector3(
    -cosLat * Math.cos(lonRad),
    Math.sin(latRad),
    cosLat * Math.sin(lonRad)
  ).normalize();
};

const appendSurfaceLine = (vertices, lonA, latA, lonB, latB) => {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(lonB - lonA), Math.abs(latB - latA)) / maxBoundarySegmentDegrees));
  let previous = latLonToVector(latA, lonA).multiplyScalar(boundaryRadius);

  for (let step = 1; step <= steps; step += 1) {
    const progress = step / steps;
    const lon = lonA + (lonB - lonA) * progress;
    const lat = latA + (latB - latA) * progress;
    const next = latLonToVector(lat, lon).multiplyScalar(boundaryRadius);

    vertices.push(previous.x, previous.y, previous.z, next.x, next.y, next.z);
    previous = next;
  }
};

const isOpenOceanIDLSegment = (lon1, lat1, lon2, lat2) => {
  // Long meridian segments that sit exactly on the ±180° antimeridian are pure
  // open-ocean administrative lines. They look like a jarring straight rule across
  // the Pacific and carry no geographic meaning near land.
  const bothAtAntimeridian = Math.abs(Math.abs(lon1) - 180) < 0.01 && Math.abs(Math.abs(lon2) - 180) < 0.01;
  const latSpan = Math.abs(lat1 - lat2);
  return bothAtAntimeridian && latSpan > 5;
};

const createBoundaryLineGeometry = (segments, scale, includeSegment) => {
  const vertices = [];

  for (const segment of segments) {
    const zoneIds = segment.slice(4);
    if (!includeSegment(zoneIds)) continue;

    const lon1 = segment[0] / scale;
    const lat1 = segment[1] / scale;
    const lon2 = segment[2] / scale;
    const lat2 = segment[3] / scale;

    // Skip the straight open-ocean antimeridian segments — they look wrong.
    if (isOpenOceanIDLSegment(lon1, lat1, lon2, lat2)) continue;

    appendSurfaceLine(vertices, lon1, lat1, lon2, lat2);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
  return geometry;
};

const getTimeZoneDateKey = (timeZone, date) => {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date);
    const year = parts.find((part) => part.type === 'year')?.value;
    const month = parts.find((part) => part.type === 'month')?.value;
    const day = parts.find((part) => part.type === 'day')?.value;

    return year && month && day ? `${year}-${month}-${day}` : null;
  } catch {
    return null;
  }
};

const createZoneDateKeys = (zones, date = new Date()) => zones.map((zone) => getTimeZoneDateKey(zone, date));

const hasCurrentDateChange = (zoneIds, zoneDateKeys) => {
  let firstDate = null;

  for (const zoneId of zoneIds) {
    const dateKey = zoneDateKeys[zoneId];
    if (!dateKey) continue;
    if (!firstDate) {
      firstDate = dateKey;
      continue;
    }
    if (dateKey !== firstDate) return true;
  }

  return false;
};

const getSunPosition = (date = new Date()) => {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start) / 86400000);
  const utcMinutes = date.getUTCHours() * 60
    + date.getUTCMinutes()
    + date.getUTCSeconds() / 60
    + date.getUTCMilliseconds() / 60000;
  const b = (2 * Math.PI * (dayOfYear - 81)) / 364;
  const equationOfTime = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  const declination = 23.44 * Math.sin((2 * Math.PI * (dayOfYear - 81)) / 365);
  const longitude = ((((720 - utcMinutes - equationOfTime) / 4) + 540) % 360) - 180;

  return {
    latitude: declination,
    longitude,
    direction: latLonToSunDirection(declination, longitude)
  };
};

// ---------------------------------------------------------------------------
// Timezone click helpers
// ---------------------------------------------------------------------------

// Convert a world-space point on the earth sphere to geographic lat/lon.
// Derived from latLonToSunDirection: world = (-cos(lat)cos(lon), sin(lat), cos(lat)sin(lon))
const worldPointToLatLon = (p) => {
  const r = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
  if (r < 1e-10) return { lat: 0, lon: 0 };
  const lat = Math.asin(Math.max(-1, Math.min(1, p.y / r))) * 180 / Math.PI;
  const lon = Math.atan2(p.z, -p.x) * 180 / Math.PI;
  return { lat, lon };
};

const normalizeLongitude = (lon) => ((((lon + 180) % 360) + 360) % 360) - 180;

const collectLatitudeCrossings = (lat, segments, scale) => {
  const EPS = 1e-4;
  const crossings = [];

  for (const seg of segments) {
    const lat1 = seg[1] / scale;
    const lat2 = seg[3] / scale;
    const latSpan = lat2 - lat1;
    if (Math.abs(latSpan) < 1e-10) continue;

    const minLat = lat1 < lat2 ? lat1 : lat2;
    const maxLat = lat1 < lat2 ? lat2 : lat1;
    if (minLat > lat + EPS || maxLat <= lat + EPS) continue;

    const lon1 = seg[0] / scale;
    const lon2 = seg[2] / scale;
    const crossLon = lon1 + ((lon2 - lon1) * (lat - lat1)) / latSpan;

    crossings.push({
      lon: normalizeLongitude(crossLon),
      zones: seg.slice(4)
    });
  }

  crossings.sort((a, b) => a.lon - b.lon);
  return crossings;
};

const getSharedZones = (a, b) => {
  if (!a || !b) return [];
  const bZones = new Set(b.zones);
  return a.zones.filter((zoneId, index, ids) => (
    bZones.has(zoneId) && ids.indexOf(zoneId) === index
  ));
};

const getRayStats = (lat, lon, crossings) => {
  const eastCounts = new Map();
  const westCounts = new Map();
  const eastDistance = new Map();
  const westDistance = new Map();

  for (const crossing of crossings) {
    const isEast = crossing.lon > lon;
    const distance = Math.abs(crossing.lon - lon);

    for (const zoneId of crossing.zones) {
      if (isEast) {
        eastCounts.set(zoneId, (eastCounts.get(zoneId) ?? 0) + 1);
        eastDistance.set(zoneId, Math.min(eastDistance.get(zoneId) ?? Infinity, distance));
      } else {
        westCounts.set(zoneId, (westCounts.get(zoneId) ?? 0) + 1);
        westDistance.set(zoneId, Math.min(westDistance.get(zoneId) ?? Infinity, distance));
      }
    }
  }

  return { eastCounts, westCounts, eastDistance, westDistance };
};

const getOddBothCandidate = (candidateIds, rayStats) => {
  let bestZone = null;
  let bestScore = Infinity;

  for (const zoneId of candidateIds) {
    const eastCount = rayStats.eastCounts.get(zoneId) ?? 0;
    const westCount = rayStats.westCounts.get(zoneId) ?? 0;
    if (eastCount % 2 !== 1 || westCount % 2 !== 1) continue;

    const score = Math.min(
      rayStats.eastDistance.get(zoneId) ?? Infinity,
      rayStats.westDistance.get(zoneId) ?? Infinity
    );
    if (score < bestScore) {
      bestScore = score;
      bestZone = zoneId;
    }
  }

  return bestZone;
};

const getTimezoneAtLatitude = (lat, lon, segments, zones, scale) => {
  const normalizedLon = normalizeLongitude(lon);
  const crossings = collectLatitudeCrossings(lat, segments, scale);
  if (!crossings.length) return null;

  const eastIndex = crossings.findIndex((crossing) => crossing.lon > normalizedLon);
  const west = eastIndex === -1
    ? crossings[crossings.length - 1]
    : crossings[(eastIndex - 1 + crossings.length) % crossings.length];
  const east = eastIndex === -1
    ? crossings[0]
    : crossings[eastIndex];

  const sharedZones = getSharedZones(west, east);
  if (sharedZones.length === 1) return zones[sharedZones[0]];

  const rayStats = getRayStats(lat, normalizedLon, crossings);
  const localOddCandidate = getOddBothCandidate(sharedZones, rayStats);
  if (localOddCandidate !== null) return zones[localOddCandidate];

  const nonEtcSharedZones = sharedZones.filter((zoneId) => !zones[zoneId]?.startsWith('Etc/'));
  if (nonEtcSharedZones.length === 1) return zones[nonEtcSharedZones[0]];

  const globalOddCandidate = getOddBothCandidate(zones.map((_, index) => index), rayStats);
  if (globalOddCandidate !== null) return zones[globalOddCandidate];

  return nonEtcSharedZones.length ? zones[nonEtcSharedZones[0]] : null;
};

// Multi-ray voting: run 5 queries at tiny latitude offsets and return the zone
// that wins the most individual queries. This removes vertex-crossing artifacts
// and near-boundary instability without letting distant crossings outvote the
// local west/east borders around the clicked point.
const getTimezoneAtPoint = (lat, lon, segments, zones, scale) => {
  const offsets = [0, 0.001, -0.001, 0.002, -0.002];
  const votes = new Map();
  for (const d of offsets) {
    const z = getTimezoneAtLatitude(lat + d, lon, segments, zones, scale);
    if (z) votes.set(z, (votes.get(z) ?? 0) + 1);
  }
  let best = null, bestV = 0;
  for (const [z, v] of votes) {
    if (v > bestV) { bestV = v; best = z; }
  }
  return best;
};

const formatTimezoneName = (tz) => {
  if (!tz) return '';
  if (tz.startsWith('Etc/')) return tz.slice(4);
  const parts = tz.split('/');
  return parts[parts.length - 1].replace(/_/g, ' ');
};

const getTimezoneRegion = (tz) => {
  if (!tz) return '';
  if (tz.startsWith('Etc/') || tz.startsWith('UTC')) return 'UTC Offset';
  return tz.split('/')[0].replace(/_/g, ' ');
};

const getTimeInfo = (tz) => {
  try {
    const now = new Date();
    const time = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).format(now);
    const date = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, weekday: 'short', month: 'short', day: 'numeric'
    }).format(now);
    const offset = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, timeZoneName: 'longOffset'
    }).formatToParts(now).find(p => p.type === 'timeZoneName')?.value ?? '';
    return { time, date, offset };
  } catch {
    return { time: '--:--:--', date: '--', offset: '' };
  }
};

// ---------------------------------------------------------------------------
// Timezone info popup (pure React, rendered outside the canvas)
// ---------------------------------------------------------------------------
const TimezoneCard = ({ zone, onClose }) => {
  const [info, setInfo] = useState(() => getTimeInfo(zone));

  useEffect(() => {
    const id = setInterval(() => setInfo(getTimeInfo(zone)), 1000);
    return () => clearInterval(id);
  }, [zone]);

  const city = formatTimezoneName(zone);
  const region = getTimezoneRegion(zone);

  return (
    <div style={{
      position: 'absolute', bottom: '18px', left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(2, 8, 26, 0.82)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(168, 237, 255, 0.18)',
      borderRadius: '18px',
      padding: '18px 26px 16px',
      color: '#f0f9ff',
      minWidth: '260px',
      maxWidth: '340px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(168,237,255,0.07), inset 0 1px 0 rgba(255,255,255,0.05)',
      zIndex: 20,
      fontFamily: 'inherit',
      userSelect: 'none',
      pointerEvents: 'none',
      animation: 'tzFadeIn 0.22s ease',
    }}>
      <style>{`@keyframes tzFadeIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: '10px', right: '12px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(148,163,184,0.7)', fontSize: '18px', lineHeight: 1,
          padding: '2px 6px', borderRadius: '6px',
          transition: 'color 0.15s',
          pointerEvents: 'auto',  // re-enable: parent is pointer-events:none
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#f0f9ff'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.7)'; }}
      >✕</button>

      {/* Region + zone id */}
      <div style={{ fontSize: '10px', color: 'rgba(168,237,255,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '3px', paddingRight: '20px' }}>
        {region}{region && ' · '}{zone}
      </div>

      {/* City name */}
      <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '8px', color: '#e2f4ff' }}>
        {city}
      </div>

      {/* Big time */}
      <div style={{
        fontSize: '44px', fontWeight: 200, letterSpacing: '-0.03em',
        fontVariantNumeric: 'tabular-nums', color: '#a8edff',
        lineHeight: 1, marginBottom: '6px',
      }}>
        {info.time}
      </div>

      {/* Date + offset */}
      <div style={{ fontSize: '12px', color: 'rgba(148,163,184,0.75)', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span>{info.date}</span>
        {info.offset && <>
          <span style={{ color: 'rgba(168,237,255,0.3)' }}>·</span>
          <span style={{ color: 'rgba(168,237,255,0.7)', fontWeight: 500 }}>{info.offset}</span>
        </>}
      </div>
    </div>
  );
};

const createStarField = () => {
  const positions = new Float32Array(starCount * 3);
  let seed = 42;

  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = 0; i < starCount; i += 1) {
    const radius = 48 + random() * 72;
    const theta = random() * Math.PI * 2;
    const phi = Math.acos((random() * 2) - 1);
    const index = i * 3;

    positions[index] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[index + 2] = radius * Math.cos(phi);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));

  return new Points(geometry, new PointsMaterial({
    color: '#f8fafc',
    size: 0.16,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.78
  }));
};

const createSunHaloTexture = () => {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);

  gradient.addColorStop(0, 'rgba(255, 248, 205, 0.92)');
  gradient.addColorStop(0.18, 'rgba(255, 207, 92, 0.58)');
  gradient.addColorStop(0.52, 'rgba(255, 128, 30, 0.2)');
  gradient.addColorStop(1, 'rgba(255, 128, 30, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

const earthVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const earthFragmentShader = `
  uniform sampler2D dayMap;
  uniform vec3 sunDirection;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;

  void main() {
    vec3 dayColor = texture2D(dayMap, vUv).rgb;
    vec3 worldNormal = normalize(vWorldNormal);
    vec3 lightDirection = normalize(sunDirection);
    vec3 viewDirection = normalize(vViewDirection);
    float sunlight = dot(lightDirection, worldNormal);
    float sunFacing = max(sunlight, 0.0);
    float dayAmount = smoothstep(-0.14, 0.08, sunlight);
    float terminator = 1.0 - smoothstep(0.0, 0.34, abs(sunlight));
    float rim = pow(1.0 - max(dot(worldNormal, viewDirection), 0.0), 2.1);
    float oceanMask = smoothstep(0.02, 0.22, dayColor.b - max(dayColor.r, dayColor.g) * 0.82);
    float greenMask = smoothstep(0.01, 0.18, dayColor.g - max(dayColor.r, dayColor.b) * 0.92);
    float surfaceBounce = sunFacing * (0.22 * oceanMask + 0.18 * greenMask);
    float oceanSheen = pow(max(dot(reflect(-lightDirection, worldNormal), viewDirection), 0.0), 18.0) * oceanMask * dayAmount;
    vec3 surfaceLift = oceanMask * vec3(0.01, 0.04, 0.09) + greenMask * vec3(0.018, 0.052, 0.018);

    vec3 litDay = dayColor * (0.86 + 0.34 * sunFacing + surfaceBounce) + vec3(0.012, 0.016, 0.022) + surfaceLift * sunFacing;
    vec3 darkEarth = dayColor * vec3(0.16, 0.18, 0.24) + vec3(0.012, 0.018, 0.030);
    vec3 color = mix(darkEarth, litDay, dayAmount);

    color += vec3(0.26, 0.40, 0.58) * oceanSheen * 0.18;
    color += dayColor * 0.025;
    color += vec3(0.04, 0.10, 0.18) * terminator * 0.10;
    color += vec3(0.14, 0.28, 0.48) * rim * 0.10;

    gl_FragColor = vec4(min(color, vec3(1.0)), 1.0);
  }
`;

const atmosphereVertexShader = `
  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;

  void main() {
    float rim = pow(1.0 - max(dot(normalize(vWorldNormal), normalize(vViewDirection)), 0.0), 2.0);
    gl_FragColor = vec4(0.28, 0.58, 1.0, rim * 0.34);
  }
`;

const GlobeViewer = () => {
  const mountRef = useRef(null);
  const clearSelectedZoneRef = useRef(() => {});
  const [selectedZone, setSelectedZone] = useState(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let disposed = false;
    mount.replaceChildren();

    const scene = new Scene();
    scene.background = new Color('#020617');

    const camera = new PerspectiveCamera(42, 1, 0.1, 200);
    const renderer = new WebGLRenderer({ antialias: true, alpha: false });
    renderer.setClearColor('#020617', 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.dataset.autoRotate = 'true';
    mount.appendChild(renderer.domElement);

    const dayMap = new TextureLoader().load('/earth.jpg');
    dayMap.colorSpace = SRGBColorSpace;
    const sunHaloMap = createSunHaloTexture();
    const sunPosition = getSunPosition();
    const sunDirection = sunPosition.direction.clone();

    const earthGroup = new Group();
    scene.add(earthGroup);

    const earthGeometry = new SphereGeometry(earthRadius, 96, 96);
    const earthMaterial = new ShaderMaterial({
      uniforms: {
        dayMap: { value: dayMap },
        sunDirection: { value: sunDirection }
      },
      vertexShader: earthVertexShader,
      fragmentShader: earthFragmentShader
    });
    const earth = new Mesh(earthGeometry, earthMaterial);
    earth.rotation.y = Math.PI;
    earthGroup.add(earth);

    const atmosphereGeometry = new SphereGeometry(earthRadius * 1.025, 96, 96);
    const atmosphereMaterial = new ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
      side: BackSide
    });
    const atmosphere = new Mesh(atmosphereGeometry, atmosphereMaterial);
    earthGroup.add(atmosphere);

    const boundaryGroup = new Group();
    boundaryGroup.rotation.y = Math.PI;
    earthGroup.add(boundaryGroup);

    const timezoneBoundaryMaterial = new LineBasicMaterial({
      color: '#a8edff',
      transparent: true,
      opacity: 0.52,
      depthWrite: false
    });
    const dateBoundaryMaterial = new LineBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.52,
      depthWrite: false
    });

    let timezoneBoundaryData = null;
    let timezoneBoundaryLines = null;
    let dateBoundaryLines = null;

    const refreshDateBoundaryLines = () => {
      if (!timezoneBoundaryData || !dateBoundaryLines) return;

      const zoneDateKeys = createZoneDateKeys(timezoneBoundaryData.zones);
      const nextGeometry = createBoundaryLineGeometry(
        timezoneBoundaryData.segments,
        timezoneBoundaryData.scale,
        (zoneIds) => hasCurrentDateChange(zoneIds, zoneDateKeys)
      );

      dateBoundaryLines.geometry.dispose();
      dateBoundaryLines.geometry = nextGeometry;
    };

    fetch('/timezone-boundaries.json')
      .then((response) => {
        if (!response.ok) throw new Error('Timezone boundaries unavailable');
        return response.json();
      })
      .then((data) => {
        if (disposed || !data?.zones || !data?.segments || !data?.scale) return;

        timezoneBoundaryData = data;
        timezoneBoundaryLines = new LineSegments(
          createBoundaryLineGeometry(data.segments, data.scale, () => true),
          timezoneBoundaryMaterial
        );
        dateBoundaryLines = new LineSegments(new BufferGeometry(), dateBoundaryMaterial);
        timezoneBoundaryLines.renderOrder = 1;
        dateBoundaryLines.renderOrder = 2;
        boundaryGroup.add(timezoneBoundaryLines, dateBoundaryLines);
        refreshDateBoundaryLines();
      })
      .catch(() => undefined);

    const stars = createStarField();
    scene.add(stars);

    const sunGroup = new Group();
    scene.add(sunGroup);

    const sunGeometry = new SphereGeometry(0.34, 48, 48);
    const sunMaterial = new MeshBasicMaterial({ color: '#ffe18a' });
    const sun = new Mesh(sunGeometry, sunMaterial);
    sunGroup.add(sun);

    const sunHalo = new Sprite(new SpriteMaterial({
      map: sunHaloMap,
      color: '#ffd986',
      blending: AdditiveBlending,
      depthWrite: false,
      transparent: true
    }));
    sunHalo.scale.set(3.2, 3.2, 1);
    sunGroup.add(sunHalo);

    const setSun = () => {
      const nextSun = getSunPosition();
      sunDirection.copy(nextSun.direction);
      earthMaterial.uniforms.sunDirection.value.copy(nextSun.direction);
      sunGroup.position.copy(nextSun.direction).multiplyScalar(18);
    };

    setSun();

    const sunYaw = Math.atan2(sunDirection.x, sunDirection.z);
    const sunPitch = Math.asin(clamp(sunDirection.y, -0.86, 0.86));
    const control = {
      autoRotate: true,
      dragging: false,
      pointerMoved: false,
      lastX: 0,
      lastY: 0,
      yaw: sunYaw,
      pitch: sunPitch,
      distance: 7,
      targetYaw: sunYaw,
      targetPitch: sunPitch,
      targetDistance: 7
    };

    const stopAutoRotate = () => {
      control.autoRotate = false;
      renderer.domElement.dataset.autoRotate = 'false';
    };

    const updateCamera = () => {
      control.yaw += (control.targetYaw - control.yaw) * 0.14;
      control.pitch += (control.targetPitch - control.pitch) * 0.14;
      control.distance += (control.targetDistance - control.distance) * 0.14;

      const cosPitch = Math.cos(control.pitch);
      camera.position.set(
        control.distance * Math.sin(control.yaw) * cosPitch,
        control.distance * Math.sin(control.pitch),
        control.distance * Math.cos(control.yaw) * cosPitch
      );
      camera.lookAt(0, 0, 0);
    };

    const resize = () => {
      const nextWidth = Math.max(1, Math.floor(mount.clientWidth || mount.offsetWidth || 1));
      const nextHeight = Math.max(1, Math.floor(mount.clientHeight || mount.offsetHeight || 1));

      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
      updateCamera();
      renderer.render(scene, camera);
    };

    resize();

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(mount);
    const lateResizeId = window.requestAnimationFrame(() => window.requestAnimationFrame(resize));

    // -----------------------------------------------------------------------
    // Selected-zone highlight geometry (created once, geometry swapped on click)
    // -----------------------------------------------------------------------
    const selectedZoneMaterial = new LineBasicMaterial({
      color: '#ffd966',
      transparent: true,
      opacity: 0.95,
      depthWrite: false
    });
    const selectedZoneLines = new LineSegments(new BufferGeometry(), selectedZoneMaterial);
    selectedZoneLines.renderOrder = 4;
    boundaryGroup.add(selectedZoneLines);

    const clearSelectedZoneHighlight = () => {
      selectedZoneLines.geometry.dispose();
      selectedZoneLines.geometry = new BufferGeometry();
    };
    clearSelectedZoneRef.current = clearSelectedZoneHighlight;

    // Raycaster for click-to-inspect
    const raycaster = new Raycaster();
    const mouse = new Vector2();

    const handleGlobeClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      // Filter hits to the camera-facing hemisphere only.
      // For a sphere at the origin, a hit point H is on the front face when
      // dot(H, cameraPos) > 0 (they're on the same side of the globe center).
      // Back-face hits — which Three.js can return for a solid sphere — have
      // dot < 0 and would map to the antipodal geographic position.
      const hits = raycaster.intersectObject(earth);
      const frontHit = hits.find(h => h.point.dot(camera.position) > 0);
      if (!frontHit) {
        // Clicked empty space or back of globe — clear selection
        setSelectedZone(null);
        clearSelectedZoneHighlight();
        return;
      }

      if (!timezoneBoundaryData) return;

      const { lat, lon } = worldPointToLatLon(frontHit.point);
      const zone = getTimezoneAtPoint(
        lat, lon,
        timezoneBoundaryData.segments,
        timezoneBoundaryData.zones,
        timezoneBoundaryData.scale
      );
      if (!zone) return;

      // Build highlight geometry for all segments of this zone
      const zoneIndex = timezoneBoundaryData.zones.indexOf(zone);
      const highlightGeo = createBoundaryLineGeometry(
        timezoneBoundaryData.segments,
        timezoneBoundaryData.scale,
        (zoneIds) => zoneIds.includes(zoneIndex)
      );
      selectedZoneLines.geometry.dispose();
      selectedZoneLines.geometry = highlightGeo;

      setSelectedZone(zone);
    };

    const handlePointerDown = (event) => {
      stopAutoRotate();
      control.dragging = true;
      control.pointerMoved = false;
      control.lastX = event.clientX;
      control.lastY = event.clientY;
      renderer.domElement.style.cursor = 'grabbing';
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event) => {
      if (!control.dragging) return;

      const dx = event.clientX - control.lastX;
      const dy = event.clientY - control.lastY;
      if (Math.abs(dx) + Math.abs(dy) > 4) control.pointerMoved = true;

      control.targetYaw -= dx * 0.006;
      control.targetPitch = clamp(control.targetPitch + dy * 0.006, -1.15, 1.15);
      control.lastX = event.clientX;
      control.lastY = event.clientY;
    };

    const handlePointerUp = (event) => {
      const wasClick = control.dragging && !control.pointerMoved;
      control.dragging = false;
      renderer.domElement.style.cursor = 'grab';
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
      if (wasClick) handleGlobeClick(event);
    };

    const handleWheel = (event) => {
      event.preventDefault();
      stopAutoRotate();
      control.targetDistance = clamp(control.targetDistance + event.deltaY * 0.005, 4.2, 12);
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('pointercancel', handlePointerUp);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    let frameId = 0;
    let lastSunUpdate = 0;
    const animate = (time) => {
      if (control.autoRotate) {
        control.targetYaw += 0.0014;
      }

      if (time - lastSunUpdate > 60000) {
        setSun();
        refreshDateBoundaryLines();
        lastSunUpdate = time;
      }

      // Pulse the selected-zone highlight
      const hasHighlight = selectedZoneLines.geometry.attributes.position?.count > 0;
      if (hasHighlight) {
        selectedZoneMaterial.opacity = 0.65 + 0.35 * Math.sin(time * 0.0025);
      }

      updateCamera();
      stars.rotation.y += 0.00018;
      sunHalo.material.rotation += 0.002;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.cancelAnimationFrame(lateResizeId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('pointercancel', handlePointerUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      clearSelectedZoneRef.current = () => {};
      earthGeometry.dispose();
      earthMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      if (timezoneBoundaryLines) timezoneBoundaryLines.geometry.dispose();
      if (dateBoundaryLines) dateBoundaryLines.geometry.dispose();
      timezoneBoundaryMaterial.dispose();
      dateBoundaryMaterial.dispose();
      selectedZoneLines.geometry.dispose();
      selectedZoneMaterial.dispose();
      stars.geometry.dispose();
      stars.material.dispose();
      sunGeometry.dispose();
      sunMaterial.dispose();
      sunHalo.material.dispose();
      dayMap.dispose();
      sunHaloMap.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: '400px',
      background: '#020617',
      overflow: 'hidden',
    }}>
      <div
        ref={mountRef}
        style={{ width: '100%', height: '100%' }}
      />
      {selectedZone && (
        <TimezoneCard
          key={selectedZone}
          zone={selectedZone}
          onClose={() => {
            clearSelectedZoneRef.current();
            setSelectedZone(null);
          }}
        />
      )}
    </div>
  );
};

export default GlobeViewer;
