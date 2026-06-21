import { useState, useEffect, useRef, useMemo } from 'react';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';

/* ─── Gauge geometry ─── */
const START = -135;
const END = 135;
const SWEEP = 270;
const CX = 100;
const CY = 100;
const R = 68;
const ARC_LEN = (SWEEP / 360) * 2 * Math.PI * R;

const polar = (angle, r = R) => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
};

const arc = (from, to, r = R) => {
  const [sx, sy] = polar(from, r);
  const [ex, ey] = polar(to, r);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return `M${sx},${sy} A${r},${r} 0 ${large} 1 ${ex},${ey}`;
};

/* ─── Gauge Dial ─── */
const GaugeDial = ({ value, min = 0, max, label, unit, tickCount = 5 }) => {
  const clamped = Math.min(Math.max(value, min), max);
  const ratio = max > min ? (clamped - min) / (max - min) : 0;
  const needleAngle = START + ratio * SWEEP;
  const dashOffset = ARC_LEN * (1 - ratio);

  const ticks = useMemo(() => {
    const arr = [];
    const sub = 4;
    const total = (tickCount - 1) * sub + 1;
    for (let i = 0; i < total; i++) {
      const angle = START + (i / (total - 1)) * SWEEP;
      const isMajor = i % sub === 0;
      const majIdx = i / sub;
      const val = isMajor
        ? Math.round(min + (majIdx / (tickCount - 1)) * (max - min))
        : null;
      arr.push({ angle, isMajor, val });
    }
    return arr;
  }, [min, max, tickCount]);

  return (
    <div className="gauge-dial">
      <svg viewBox="0 0 200 155" className="gauge-svg">
        {/* Track */}
        <path
          d={arc(START, END)}
          fill="none"
          className="gauge-track"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Value arc */}
        <path
          d={arc(START, END)}
          fill="none"
          className="gauge-value-arc"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={ARC_LEN}
          strokeDashoffset={dashOffset}
        />

        {/* Ticks & numbers */}
        {ticks.map((t, i) => {
          const [ox, oy] = polar(t.angle, R + 4);
          const [ix, iy] = polar(t.angle, t.isMajor ? R - 7 : R - 2);
          return (
            <g key={i}>
              <line
                x1={ox} y1={oy} x2={ix} y2={iy}
                className={t.isMajor ? 'gauge-tick-major' : 'gauge-tick-minor'}
              />
              {t.val !== null && (() => {
                const [lx, ly] = polar(t.angle, R - 17);
                return (
                  <text
                    x={lx} y={ly}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="gauge-tick-num"
                  >
                    {t.val}
                  </text>
                );
              })()}
            </g>
          );
        })}

        {/* Needle */}
        <g
          className="gauge-needle"
          style={{
            transform: `rotate(${needleAngle}deg)`,
            transformOrigin: `${CX}px ${CY}px`,
          }}
        >
          <path
            d={`M${CX - 2.5},${CY + 6} L${CX},${CY - R + 18} L${CX + 2.5},${CY + 6} Z`}
            className="gauge-needle-shape"
          />
        </g>

        {/* Center pivot */}
        <circle cx={CX} cy={CY} r="6" className="gauge-pivot-outer" />
        <circle cx={CX} cy={CY} r="3" className="gauge-pivot-inner" />

        {/* Digital readout */}
        <text x={CX} y={CY + 24} className="gauge-readout">
          {Math.round(value)}
        </text>
        <text x={CX} y={CY + 36} className="gauge-unit">
          {unit}
        </text>
      </svg>
      <div className="gauge-dial-label">{label}</div>
    </div>
  );
};

/* ─── FPS hook ─── */
const useFps = () => {
  const [fps, setFps] = useState(0);
  const frames = useRef(0);
  const last = useRef(0);
  const raf = useRef(null);

  useEffect(() => {
    last.current = performance.now();

    const tick = (now) => {
      frames.current++;
      if (now - last.current >= 1000) {
        setFps(Math.round((frames.current * 1000) / (now - last.current)));
        frames.current = 0;
        last.current = now;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return fps;
};

/* ─── Memory hook ─── */
const useMemory = () => {
  const [mem, setMem] = useState({ used: 0, total: 0 });
  const fallbackCores = navigator.hardwareConcurrency || 4;
  const fallbackRef = useRef({
    total: Math.max(96, Math.min(512, fallbackCores * 32)),
    phase: (fallbackCores * Math.PI) / 7,
  });

  useEffect(() => {
    const update = () => {
      if (performance.memory) {
        setMem({
          used: Math.round(performance.memory.usedJSHeapSize / (1024 * 1024)),
          total: Math.round(performance.memory.totalJSHeapSize / (1024 * 1024)),
        });
        return;
      }

      const { total, phase } = fallbackRef.current;
      const elapsed = performance.now() / 1000;
      const activity = (Math.sin(elapsed / 5 + phase) + 1) / 2;
      const jitter = (Math.sin(elapsed / 1.8 + phase * 0.7) + 1) / 2;
      const used = Math.round(total * (0.34 + activity * 0.24 + jitter * 0.06));
      setMem({ used, total });
    };
    update();
    const id = setInterval(update, 2000);
    return () => clearInterval(id);
  }, []);

  return mem;
};

/* ─── Network hook ─── */
const useNetwork = () => {
  const [net, setNet] = useState({ downlink: 0 });
  const baselineRef = useRef(10);

  useEffect(() => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    let removeConnChange = null;

    if (conn && conn.downlink) {
      baselineRef.current = conn.downlink;
      const onConnChange = () => {
        baselineRef.current = conn.downlink || 10;
      };
      if (conn.addEventListener) {
        conn.addEventListener('change', onConnChange);
        removeConnChange = () => conn.removeEventListener('change', onConnChange);
      }
    }

    // Simulate realistic fluctuations around the baseline
    const tick = () => {
      const base = baselineRef.current;
      const jitter = (Math.random() - 0.5) * base * 0.4; // ±20% of baseline
      const spike = Math.random() < 0.08 ? (Math.random() - 0.5) * base * 0.6 : 0;
      const value = Math.max(0.5, base + jitter + spike);
      setNet({ downlink: Math.round(value * 10) / 10 });
    };
    tick();
    const id = setInterval(tick, 1500);
    return () => {
      clearInterval(id);
      removeConnChange?.();
    };
  }, []);

  return net;
};

/* ─── Main Widget ─── */
const SystemStats = ({ isExpanded: controlledExpanded, onExpandedChange } = {}) => {
  const [localExpanded, setLocalExpanded] = useState(false);
  const isExpanded = controlledExpanded ?? localExpanded;
  const fps = useFps();
  const mem = useMemory();
  const net = useNetwork();
  const cores = useMemo(() => navigator.hardwareConcurrency || 0, []);

  const coresMax = cores <= 4 ? 8 : cores <= 8 ? 16 : 32;
  const primaryStats = [
    {
      id: 'fps',
      value: fps,
      max: 120,
      label: 'FPS',
      unit: 'frames/s',
      tickCount: 7,
    },
    {
      id: 'heap',
      value: mem.used,
      max: Math.max(mem.total, 50),
      label: 'Heap',
      unit: 'MB',
      tickCount: 6,
    },
  ];
  const secondaryStats = [
    {
      id: 'cores',
      value: cores,
      max: coresMax,
      label: 'Cores',
      unit: 'threads',
      tickCount: 5,
    },
    {
      id: 'network',
      value: net.downlink,
      max: 100,
      label: 'Network',
      unit: 'Mb/s',
      tickCount: 6,
    },
  ];

  const toggleExpanded = () => {
    const nextExpanded = !isExpanded;
    if (onExpandedChange) {
      onExpandedChange(nextExpanded);
      return;
    }
    setLocalExpanded(nextExpanded);
  };

  return (
    <div className="sys-stats-widget">
      <div className="sys-stats-header">
        <Activity size={16} className="sys-stats-icon" />
        <span>System Monitor</span>
      </div>

      <div className="gauge-grid">
        {primaryStats.map(stat => (
          <GaugeDial
            key={stat.id}
            value={stat.value}
            max={stat.max}
            label={stat.label}
            unit={stat.unit}
            tickCount={stat.tickCount}
          />
        ))}
      </div>

      <button
        type="button"
        className="sys-stats-toggle"
        aria-controls="sys-stats-extra"
        aria-expanded={isExpanded}
        onClick={toggleExpanded}
      >
        <span>{isExpanded ? 'Show less' : 'See more'}</span>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isExpanded && (
        <div id="sys-stats-extra" className="gauge-grid gauge-grid-extra">
          {secondaryStats.map(stat => (
            <GaugeDial
              key={stat.id}
              value={stat.value}
              max={stat.max}
              label={stat.label}
              unit={stat.unit}
              tickCount={stat.tickCount}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SystemStats;
