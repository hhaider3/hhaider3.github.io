import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Home,
  Maximize2,
  Minimize2,
  Minus,
  Palette,
  RotateCw,
  X,
} from 'lucide-react';
import ColorSwitcher from '../ColorSwitcher';

const RESIZE_EDGES = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
const MIN_WIN_W = 420;
const MIN_WIN_H = 300;

let windowInstanceCounter = 0;

const getNextWindowOffset = () => {
  const offset = windowInstanceCounter * 30;
  windowInstanceCounter += 1;
  return offset;
};

const getInitialWindowRect = (offset = 0) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.max(MIN_WIN_W, Math.min(1080, vw - 44));
  const h = Math.max(MIN_WIN_H, Math.min(720, vh - 124));
  const baseX = Math.round((vw - w) / 2);
  const baseY = 58;
  const boundedOffset = offset % 180;
  const x = Math.max(0, Math.min(baseX + boundedOffset, vw - w));
  const y = Math.max(0, Math.min(baseY + boundedOffset, vh - h - 52));

  return { x, y, w, h };
};

const BrowserWindow = ({
  app,
  isMaximized,
  isMobile,
  zIndex,
  openOrigin,
  minimizeRequestId,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  theme,
  themeColors,
  onThemeColorsChange,
}) => {
  const Content = app.component;
  const [cascadeOffset] = useState(getNextWindowOffset);
  const [isColorPanelOpen, setIsColorPanelOpen] = useState(false);
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [minimizeAnimationStyle, setMinimizeAnimationStyle] = useState({});
  const [winRect, setWinRect] = useState(() => (
    typeof window !== 'undefined' && !isMobile ? getInitialWindowRect(cascadeOffset) : null
  ));
  const interactionRef = useRef(null);
  const windowRef = useRef(null);
  const minimizeTimerRef = useRef(null);
  const lastMinimizeRequestRef = useRef(minimizeRequestId);

  useEffect(() => () => {
    if (minimizeTimerRef.current) {
      window.clearTimeout(minimizeTimerRef.current);
    }
  }, []);

  const resolveRect = useCallback(() => {
    if (winRect) return winRect;
    const rect = getInitialWindowRect(cascadeOffset);
    setWinRect(rect);
    return rect;
  }, [cascadeOffset, winRect]);

  const onTitlePointerDown = useCallback((e) => {
    if (e.button !== 0 || isMaximized) return;
    if (e.target.closest('button')) return;
    e.preventDefault();
    const rect = resolveRect();
    interactionRef.current = {
      kind: 'drag',
      pointerId: e.pointerId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: rect.x,
      startY: rect.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [isMaximized, resolveRect]);

  const onTitlePointerMove = useCallback((e) => {
    const info = interactionRef.current;
    if (!info || info.kind !== 'drag' || info.pointerId !== e.pointerId) return;
    const dx = e.clientX - info.startMouseX;
    const dy = e.clientY - info.startMouseY;
    setWinRect(prev => {
      const r = prev || resolveRect();
      const maxX = window.innerWidth - r.w;
      const maxY = window.innerHeight - 52 - 40;
      return {
        ...r,
        x: Math.max(0, Math.min(maxX, info.startX + dx)),
        y: Math.max(0, Math.min(maxY, info.startY + dy)),
      };
    });
  }, [resolveRect]);

  const onTitlePointerUp = useCallback((e) => {
    const info = interactionRef.current;
    if (!info || info.kind !== 'drag' || info.pointerId !== e.pointerId) return;
    interactionRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  const onResizePointerDown = useCallback((e) => {
    if (e.button !== 0 || isMaximized) return;
    const edge = e.currentTarget.dataset.edge;
    if (!edge) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = resolveRect();
    interactionRef.current = {
      kind: 'resize',
      edge,
      pointerId: e.pointerId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: rect.x,
      startY: rect.y,
      startW: rect.w,
      startH: rect.h,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [isMaximized, resolveRect]);

  const onResizePointerMove = useCallback((e) => {
    const info = interactionRef.current;
    if (!info || info.kind !== 'resize' || info.pointerId !== e.pointerId) return;
    const dx = e.clientX - info.startMouseX;
    const dy = e.clientY - info.startMouseY;
    const edge = info.edge;

    setWinRect(() => {
      let { startX: x, startY: y, startW: w, startH: h } = info;

      if (edge.includes('e')) {
        w = Math.max(MIN_WIN_W, info.startW + dx);
      }
      if (edge.includes('w')) {
        const newW = Math.max(MIN_WIN_W, info.startW - dx);
        x = info.startX + (info.startW - newW);
        w = newW;
      }
      if (edge.includes('s')) {
        h = Math.max(MIN_WIN_H, info.startH + dy);
      }
      if (edge.includes('n')) {
        const newH = Math.max(MIN_WIN_H, info.startH - dy);
        y = info.startY + (info.startH - newH);
        h = newH;
      }

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      x = Math.max(0, Math.min(x, vw - MIN_WIN_W));
      y = Math.max(0, y);
      w = Math.min(w, vw - x);
      h = Math.min(h, vh - 52 - y);

      return { x, y, w, h };
    });
  }, []);

  const onResizePointerUp = useCallback((e) => {
    const info = interactionRef.current;
    if (!info || info.kind !== 'resize' || info.pointerId !== e.pointerId) return;
    interactionRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  const onTitleDoubleClick = useCallback((e) => {
    if (e.target.closest('button')) return;
    onToggleMaximize();
  }, [onToggleMaximize]);

  const getMinimizeTargetRect = useCallback(() => {
    const target = document.querySelector(`[data-taskbar-id="${app.id}"]`) || document.querySelector('.start-orb');
    if (target) {
      return target.getBoundingClientRect();
    }

    return {
      left: 58,
      top: window.innerHeight - 46,
      width: 132,
      height: 34,
    };
  }, [app.id]);

  const handleMinimize = useCallback(() => {
    if (isMinimizing) {
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rect = windowRef.current?.getBoundingClientRect();
    if (reduceMotion || !rect) {
      onMinimize();
      return;
    }

    const target = getMinimizeTargetRect();
    const dx = target.left + target.width / 2 - (rect.left + rect.width / 2);
    const dy = target.top + target.height / 2 - (rect.top + rect.height / 2);

    setMinimizeAnimationStyle({
      '--window-minimize-dx': `${dx}px`,
      '--window-minimize-dy': `${dy}px`,
      '--window-minimize-scale-x': `${Math.max(0.05, Math.min(0.22, target.width / rect.width))}`,
      '--window-minimize-scale-y': `${Math.max(0.05, Math.min(0.22, target.height / rect.height))}`,
    });
    setIsMinimizing(true);

    minimizeTimerRef.current = window.setTimeout(() => {
      onMinimize();
    }, 150);
  }, [getMinimizeTargetRect, isMinimizing, onMinimize]);

  useEffect(() => {
    if (!minimizeRequestId || minimizeRequestId === lastMinimizeRequestRef.current) {
      return;
    }

    lastMinimizeRequestRef.current = minimizeRequestId;
    handleMinimize();
  }, [handleMinimize, minimizeRequestId]);

  const canInteract = !isMobile;
  const mobileRect = typeof window !== 'undefined' && isMobile ? {
    x: 8,
    y: 8,
    w: Math.max(1, window.innerWidth - 16),
    h: Math.max(1, window.innerHeight - 72),
  } : null;
  const openingRect = canInteract ? winRect : mobileRect;
  const openAnimationStyle = openOrigin && openingRect && !isMaximized ? {
    '--window-open-origin-x': `${openOrigin.centerX - openingRect.x}px`,
    '--window-open-origin-y': `${openOrigin.centerY - openingRect.y}px`,
    '--window-open-scale-x': `${Math.max(0.05, Math.min(0.18, openOrigin.width / openingRect.w))}`,
    '--window-open-scale-y': `${Math.max(0.05, Math.min(0.18, openOrigin.height / openingRect.h))}`,
  } : {};
  const windowStyle = canInteract ? {
    zIndex: zIndex || 1,
    ...openAnimationStyle,
    ...minimizeAnimationStyle,
    ...(!isMaximized && winRect ? {
      top: `${winRect.y}px`,
      left: `${winRect.x}px`,
      width: `${winRect.w}px`,
      height: `${winRect.h}px`,
      transform: 'none',
    } : {}),
  } : {
    ...openAnimationStyle,
    ...minimizeAnimationStyle,
  };

  return (
    <section
      ref={windowRef}
      className={`portfolio-window ${isMaximized ? 'maximized' : ''} ${openOrigin && !isMaximized ? 'window-opening' : ''} ${isMinimizing ? 'window-minimizing' : ''}`}
      aria-label={`${app.title} window`}
      style={windowStyle}
      onPointerDown={canInteract ? onFocus : undefined}
    >
      <div className="window-frame-glow" aria-hidden="true"></div>

      {canInteract && !isMaximized && RESIZE_EDGES.map(edge => (
        <div
          key={edge}
          className={`win-resize-handle win-resize-${edge}`}
          data-edge={edge}
          onPointerDown={onResizePointerDown}
          onPointerMove={onResizePointerMove}
          onPointerUp={onResizePointerUp}
          onPointerCancel={onResizePointerUp}
        />
      ))}

      <div
        className="window-titlebar"
        onPointerDown={canInteract ? onTitlePointerDown : undefined}
        onPointerMove={canInteract ? onTitlePointerMove : undefined}
        onPointerUp={canInteract ? onTitlePointerUp : undefined}
        onPointerCancel={canInteract ? onTitlePointerUp : undefined}
        onDoubleClick={canInteract ? onTitleDoubleClick : undefined}
        style={canInteract ? { cursor: isMaximized ? 'default' : 'grab', touchAction: 'none' } : undefined}
      >
        <div className="window-title">
          <span className={`window-favicon ${app.accent}`}>{app.icon}</span>
          <span>{app.title}</span>
        </div>

        <div className="window-title-actions">
          <button
            type="button"
            className={`window-color-button ${isColorPanelOpen ? 'active' : ''}`}
            aria-label="Open color switcher"
            aria-expanded={isColorPanelOpen}
            title="Colors"
            onClick={() => setIsColorPanelOpen(prev => !prev)}
          >
            <Palette size={14} />
          </button>

          <div className="window-controls" aria-label="Window controls">
            <button type="button" aria-label="Minimize window" onClick={handleMinimize}>
              <Minus size={14} />
            </button>
            <button type="button" aria-label="Toggle maximize window" onClick={onToggleMaximize}>
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button type="button" className="window-close" aria-label="Close window" onClick={onClose}>
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      {isColorPanelOpen && (
        <div className="window-color-popover">
          <ColorSwitcher
            theme={theme}
            colors={themeColors}
            onColorsChange={onThemeColorsChange}
            wheelSize={92}
            compact
          />
        </div>
      )}

      <div className="browser-toolbar">
        <div className="browser-nav-buttons" aria-hidden="true">
          <span><ArrowLeft size={14} /></span>
          <span><ArrowRight size={14} /></span>
          <span><RotateCw size={14} /></span>
        </div>
        <div className="browser-address">
          <span className="address-shield"><Home size={14} /></span>
          <span>portfolio://hasan/{app.id}</span>
        </div>
      </div>

      <div className="window-content">
        <Suspense fallback={<div style={{ padding: '24px' }}>Loading...</div>}>
          <Content />
        </Suspense>
      </div>
    </section>
  );
};

export default BrowserWindow;
