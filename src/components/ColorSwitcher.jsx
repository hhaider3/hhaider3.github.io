import { useState, useEffect, useRef, useCallback } from 'react';
import { Palette, RotateCcw } from 'lucide-react';
import { WALLPAPER_COLOR_DEFAULTS } from '../constants/colors';

// Convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
};

// Convert hex to HSL
const hexToHsl = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  const rN = r / 255, gN = g / 255, bN = b / 255;
  const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rN: h = ((gN - bN) / d + (gN < bN ? 6 : 0)) / 6; break;
      case gN: h = ((bN - rN) / d + 2) / 6; break;
      case bN: h = ((rN - gN) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

// Convert HSL to hex
const hslToHex = (h, s, l) => {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Darken a hex color
const darkenHex = (hex, amount) => {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, Math.max(0, l - amount));
};

// Color wheel canvas renderer
const ColorWheel = ({ size, selectedHue, selectedSat, onSelect }) => {
  const canvasRef = useRef(null);
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const canvasSize = size * dpr;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 4;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const imageData = ctx.createImageData(canvasSize, canvasSize);

    for (let py = 0; py < canvasSize; py++) {
      for (let px = 0; px < canvasSize; px++) {
        // Map pixel back to CSS coordinates
        const x = px / dpr;
        const y = py / dpr;
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= radius) {
          let angle = Math.atan2(dy, dx) * (180 / Math.PI);
          if (angle < 0) angle += 360;
          const sat = (dist / radius) * 100;
          const hex = hslToHex(angle, sat, 50);
          const rgb = hexToRgb(hex);
          const idx = (py * canvasSize + px) * 4;
          imageData.data[idx] = rgb.r;
          imageData.data[idx + 1] = rgb.g;
          imageData.data[idx + 2] = rgb.b;
          imageData.data[idx + 3] = 255;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, [size, dpr, canvasSize, centerX, centerY, radius]);

  // Draw selection indicator
  const indicatorAngle = (selectedHue * Math.PI) / 180;
  const indicatorDist = (selectedSat / 100) * radius;
  const ix = centerX + indicatorDist * Math.cos(indicatorAngle);
  const iy = centerY + indicatorDist * Math.sin(indicatorAngle);

  const handleInteraction = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    const dx = x - centerX;
    const dy = y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= radius) {
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      const sat = Math.min((dist / radius) * 100, 100);
      onSelect(Math.round(angle), Math.round(sat));
    }
  }, [centerX, centerY, radius, onSelect]);

  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => { e.preventDefault(); handleInteraction(e); };
    const handleUp = () => setDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [dragging, handleInteraction]);

  return (
    <div className="color-wheel-container" style={{ position: 'relative', width: size, height: size }}>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        style={{ width: size, height: size, borderRadius: '50%', cursor: 'crosshair' }}
        onMouseDown={(e) => { setDragging(true); handleInteraction(e); }}
        onTouchStart={(e) => { setDragging(true); handleInteraction(e); }}
      />
      <div
        className="wheel-indicator"
        style={{
          position: 'absolute',
          left: ix - 8,
          top: iy - 8,
          width: 16,
          height: 16,
          borderRadius: '50%',
          border: '3px solid #fff',
          boxShadow: '0 0 4px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
          backgroundColor: hslToHex(selectedHue, selectedSat, 50),
        }}
      />
    </div>
  );
};

const ColorSwitcher = ({
  theme,
  wheelSize = 160,
  colors,
  onColorsChange,
  compact = false
}) => {
  const [editingColor, setEditingColor] = useState('primary');
  const [internalColors, setInternalColors] = useState(WALLPAPER_COLOR_DEFAULTS);

  const themeColors = colors || internalColors;
  const setThemeColors = onColorsChange || setInternalColors;
  const currentColors = themeColors[theme] || WALLPAPER_COLOR_DEFAULTS.dark;
  const primaryColor = currentColors.primary;
  const secondaryColor = currentColors.secondary;

  const activeColor = editingColor === 'primary' ? primaryColor : secondaryColor;
  const activeHsl = hexToHsl(activeColor);
  const lightness = activeHsl.l;

  const applyColor = useCallback((hex, target) => {
    const rgb = hexToRgb(hex);
    const root = document.documentElement;
    if (target === 'primary') {
      root.style.setProperty('--primary', hex);
      root.style.setProperty('--primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
      root.style.setProperty('--primary-hover', darkenHex(hex, 12));
      root.style.setProperty('--wallpaper-primary', hex);
      root.style.setProperty('--wallpaper-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    } else {
      root.style.setProperty('--secondary', hex);
      root.style.setProperty('--secondary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
      root.style.setProperty('--wallpaper-secondary', hex);
      root.style.setProperty('--wallpaper-secondary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }
  }, []);

  const updateColor = useCallback((target, hex) => {
    setThemeColors(prev => ({
      ...prev,
      [theme]: {
        ...(prev[theme] || WALLPAPER_COLOR_DEFAULTS[theme] || WALLPAPER_COLOR_DEFAULTS.dark),
        [target]: hex
      }
    }));
  }, [setThemeColors, theme]);

  const handleWheelSelect = useCallback((hue, sat) => {
    const hex = hslToHex(hue, sat, lightness);
    updateColor(editingColor, hex);
  }, [editingColor, lightness, updateColor]);

  const handleLightnessChange = (e) => {
    const newL = parseInt(e.target.value);
    const hsl = hexToHsl(activeColor);
    const hex = hslToHex(hsl.h, hsl.s, newL);
    updateColor(editingColor, hex);
  };

  const handleReset = () => {
    const defaults = theme === 'dark' ? WALLPAPER_COLOR_DEFAULTS.dark : WALLPAPER_COLOR_DEFAULTS.light;
    setThemeColors(prev => ({
      ...prev,
      [theme]: defaults
    }));
  };

  useEffect(() => {
    applyColor(primaryColor, 'primary');
    applyColor(secondaryColor, 'secondary');
  }, [primaryColor, secondaryColor, applyColor]);

  return (
    <div className={`color-switcher-inline ${compact ? 'compact' : ''}`}>
      <div className="cs-header">
        <h4 className="cs-title">
          <Palette size={16} /> Customize Colors
        </h4>
      </div>

      <div className="cs-tabs">
        <button
          className={`cs-tab ${editingColor === 'primary' ? 'active' : ''}`}
          onClick={() => setEditingColor('primary')}
        >
          <span className="cs-tab-swatch" style={{ background: primaryColor }}></span>
          <span style={{ color: primaryColor }}>Primary</span>
        </button>
        <button
          className={`cs-tab ${editingColor === 'secondary' ? 'active' : ''}`}
          onClick={() => setEditingColor('secondary')}
        >
          <span className="cs-tab-swatch" style={{ background: secondaryColor }}></span>
          <span style={{ color: secondaryColor }}>Secondary</span>
        </button>
      </div>

      <div className="cs-wheel-wrapper">
        <ColorWheel
          size={wheelSize}
          selectedHue={activeHsl.h}
          selectedSat={activeHsl.s}
          onSelect={handleWheelSelect}
        />
      </div>

      <div className="cs-lightness">
        <label className="cs-slider-label" style={{ color: primaryColor }}>Lightness</label>
        <div className="cs-slider-row">
          <input
            type="range"
            min="15"
            max="85"
            value={lightness}
            onChange={handleLightnessChange}
            className="cs-slider"
            style={{ '--slider-color': activeColor }}
          />
          <span className="cs-slider-value">{lightness}%</span>
        </div>
      </div>

      <div className="cs-preview">
        <div className="cs-preview-swatch" style={{ background: primaryColor }}>
          <span>Aa</span>
        </div>
        <div className="cs-preview-gradient" style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
        }}></div>
        <div className="cs-preview-swatch" style={{ background: secondaryColor }}>
          <span>Aa</span>
        </div>
      </div>

      <button className="cs-reset" onClick={handleReset}>
        <RotateCcw size={14} /> Reset to Default
      </button>
    </div>
  );
};

export default ColorSwitcher;
