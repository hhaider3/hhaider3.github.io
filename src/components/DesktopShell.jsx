import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  FileText,
  Folder,
  Home,
  Mail,
  Maximize2,
  Minimize2,
  Minus,
  Palette,
  Power,
  RotateCw,
  User,
  Wrench,
  X
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import About from './About';
import Experience from './Experience';
import Projects from './Projects';
import Skills from './Skills';
import Publications from './Publications';
import Contact from './Contact';
import DualClock from './DualClock';
import ColorSwitcher from './ColorSwitcher';
import SystemStats from './SystemStats';
import { WALLPAPER_COLOR_DEFAULTS } from '../constants/colors';
import wallpaper from '../assets/win7-portfolio-wallpaper.png';

const linkedInUrl = 'https://www.linkedin.com/in/hasan-haider-52026a67/';
const colorStorageKey = 'portfolioThemeColors';

const getInitialThemeColors = () => {
  if (typeof window === 'undefined') {
    return WALLPAPER_COLOR_DEFAULTS;
  }

  const savedColors = window.localStorage.getItem(colorStorageKey);
  if (!savedColors) {
    return WALLPAPER_COLOR_DEFAULTS;
  }

  try {
    const parsedColors = JSON.parse(savedColors);
    return {
      dark: {
        ...WALLPAPER_COLOR_DEFAULTS.dark,
        ...(parsedColors.dark || {})
      },
      light: {
        ...WALLPAPER_COLOR_DEFAULTS.light,
        ...(parsedColors.light || {})
      }
    };
  } catch {
    return WALLPAPER_COLOR_DEFAULTS;
  }
};

const MOBILE_QUERY = '(max-width: 1020px)';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_QUERY).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
};

const TaskbarClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="taskbar-clock" aria-label="Current local time">
      <span>
        {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
      </span>
      <span>
        {now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
      </span>
    </div>
  );
};

const DesktopIcon = ({ item, isSelected, onSelect, onOpen }) => {
  const handleClick = () => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      onOpen(item);
      return;
    }

    onSelect(item.id);
  };

  return (
    <button
      type="button"
      data-desktop-id={item.id}
      className={`desktop-icon ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      onDoubleClick={() => onOpen(item)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(item);
        }
      }}
      title={item.kind === 'internal' ? `Open ${item.title}` : `Open ${item.title}`}
      aria-label={`Open ${item.title}`}
    >
      <span className={`desktop-icon-tile ${item.accent}`}>
        {item.icon}
      </span>
      <span className="desktop-icon-label">{item.title}</span>
    </button>
  );
};

const RESIZE_EDGES = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
const MIN_WIN_W = 420;
const MIN_WIN_H = 300;

let windowInstanceCounter = 0;

const BrowserWindow = ({
  app,
  isMaximized,
  isMobile,
  zIndex,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  theme,
  themeColors,
  onThemeColorsChange
}) => {
  const [isColorPanelOpen, setIsColorPanelOpen] = useState(false);
  const Content = app.component;

  /* ---- position / size state ---- */
  const [winRect, setWinRect] = useState(null);         // null = CSS default centering
  const interactionRef = useRef(null);                    // drag / resize tracking
  const windowRef = useRef(null);

  /* Cascade offset so multiple windows don't overlap exactly */
  const cascadeOffset = useRef(windowInstanceCounter++ * 30);

  /* Compute initial centered rect on first drag / resize if still null */
  const resolveRect = useCallback(() => {
    if (winRect) return winRect;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(1080, vw - 44);
    const h = Math.min(720, vh - 124);
    const baseX = Math.round((vw - w) / 2);
    const baseY = 58;
    const offset = cascadeOffset.current % 180;
    const x = Math.min(baseX + offset, vw - w);
    const y = Math.min(baseY + offset, vh - h - 52);
    const rect = { x, y, w, h };
    setWinRect(rect);
    return rect;
  }, [winRect]);

  /* ---- DRAG ---- */
  const onTitlePointerDown = useCallback((e) => {
    if (e.button !== 0 || isMaximized) return;
    // don't start drag when clicking buttons inside titlebar
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
      const maxY = window.innerHeight - 52 - 40; // leave room for taskbar
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

  /* ---- RESIZE ---- */
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

      // clamp within viewport
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

  /* ---- double-click title bar to maximize toggle ---- */
  const onTitleDoubleClick = useCallback((e) => {
    if (e.target.closest('button')) return;
    onToggleMaximize();
  }, [onToggleMaximize]);

  /* ---- style ---- */
  const canInteract = !isMobile;
  const windowStyle = canInteract ? {
    zIndex: zIndex || 1,
    ...(!isMaximized && winRect ? {
      top: `${winRect.y}px`,
      left: `${winRect.x}px`,
      width: `${winRect.w}px`,
      height: `${winRect.h}px`,
      transform: 'none',
    } : {}),
  } : undefined;

  return (
    <section
      ref={windowRef}
      className={`portfolio-window ${isMaximized ? 'maximized' : ''}`}
      aria-label={`${app.title} window`}
      style={windowStyle}
      onPointerDown={canInteract ? onFocus : undefined}
    >
      <div className="window-frame-glow" aria-hidden="true"></div>

      {/* Resize handles (desktop only, hidden when maximized) */}
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
            <button type="button" aria-label="Minimize window" onClick={onMinimize}>
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
        <Content />
      </div>
    </section>
  );
};

const selectionThreshold = 4;

const getSelectionRect = ({ startX, startY, currentX, currentY }) => ({
  left: Math.min(startX, currentX),
  top: Math.min(startY, currentY),
  width: Math.abs(currentX - startX),
  height: Math.abs(currentY - startY),
});

const doesRectIntersect = (a, b) => (
  a.left < b.right
  && a.left + a.width > b.left
  && a.top < b.bottom
  && a.top + a.height > b.top
);

const DesktopShell = ({ theme, toggleTheme }) => {
  const isMobile = useIsMobile();
  const desktopRef = useRef(null);
  const activeSelectionPointer = useRef(null);
  const suppressNextDesktopClick = useRef(false);
  const [selectedIds, setSelectedIds] = useState(['about']);
  const [selectionBox, setSelectionBox] = useState(null);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [themeColors, setThemeColors] = useState(getInitialThemeColors);

  /* ---- Mobile: single-window state (old behavior) ---- */
  const [mobileAppId, setMobileAppId] = useState(null);
  const [mobileMaximized, setMobileMaximized] = useState(false);
  const [mobileMinimized, setMobileMinimized] = useState(false);

  /* ---- Desktop: multi-window state ---- */
  const [openWindows, setOpenWindows] = useState([]);
  // openWindows entries: { id, isMaximized, isMinimized, zIndex }
  const zCounterRef = useRef(1);

  const nextZ = useCallback(() => ++zCounterRef.current, []);

  useEffect(() => {
    window.localStorage.setItem(colorStorageKey, JSON.stringify(themeColors));
  }, [themeColors]);

  const internalApps = useMemo(() => [
    {
      id: 'about',
      title: 'About Me',
      component: About,
      icon: <User size={28} />,
      accent: 'accent-blue'
    },
    {
      id: 'experience',
      title: 'Experience',
      component: Experience,
      icon: <Briefcase size={28} />,
      accent: 'accent-amber'
    },
    {
      id: 'projects',
      title: 'Projects',
      component: Projects,
      icon: <Folder size={28} />,
      accent: 'accent-teal'
    },
    {
      id: 'skills',
      title: 'Skills',
      component: Skills,
      icon: <Wrench size={28} />,
      accent: 'accent-violet'
    },
    {
      id: 'publications',
      title: 'Publications',
      component: Publications,
      icon: <BookOpen size={28} />,
      accent: 'accent-green'
    },
    {
      id: 'contact',
      title: 'Contact',
      component: Contact,
      icon: <Mail size={28} />,
      accent: 'accent-rose'
    }
  ], []);

  const externalApps = useMemo(() => [
    {
      id: 'cv',
      title: 'Resume',
      href: '/Hasan-Haider-Resume.pdf',
      icon: <FileText size={28} />,
      accent: 'accent-red'
    },
    {
      id: 'github',
      title: 'GitHub',
      href: 'https://github.com/hhaider3',
      icon: <FaGithub size={28} />,
      accent: 'accent-slate'
    },
    {
      id: 'linkedin',
      title: 'LinkedIn',
      href: linkedInUrl,
      icon: <FaLinkedin size={28} />,
      accent: 'accent-linkedin'
    },
    {
      id: 'email',
      title: 'Email',
      href: 'mailto:hasanhaider009@gmail.com',
      icon: <Mail size={28} />,
      accent: 'accent-cyan'
    }
  ], []);

  const desktopItems = useMemo(() => [
    ...internalApps.map(item => ({ ...item, kind: 'internal' })),
    ...externalApps.map(item => ({ ...item, kind: 'external' }))
  ], [internalApps, externalApps]);

  const activeSelectionRect = selectionBox ? getSelectionRect(selectionBox) : null;
  const isSelectionVisible = activeSelectionRect
    && (activeSelectionRect.width > selectionThreshold || activeSelectionRect.height > selectionThreshold);

  const shouldStartDesktopSelection = (target) => {
    if (!(target instanceof Element)) {
      return false;
    }

    const blockedElement = target.closest(
      '.desktop-icon, .desktop-widgets, .portfolio-window, .win7-taskbar, .start-menu, button, a, input, textarea, select'
    );

    return !blockedElement && !!target.closest('.win7-desktop, .desktop-stage, .desktop-icons');
  };

  const getSelectedIconIdsInRect = (selectionRect) => {
    if (!desktopRef.current) {
      return [];
    }

    return Array.from(desktopRef.current.querySelectorAll('.desktop-icon[data-desktop-id]'))
      .filter(icon => {
        const iconRect = icon.getBoundingClientRect();
        return doesRectIntersect(selectionRect, iconRect);
      })
      .map(icon => icon.dataset.desktopId);
  };

  const handleDesktopPointerDown = (event) => {
    if (event.button !== 0 || event.pointerType === 'touch' || !shouldStartDesktopSelection(event.target)) {
      return;
    }

    event.preventDefault();
    activeSelectionPointer.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsStartOpen(false);
    setSelectedIds([]);
    setSelectionBox({
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
    });
  };

  const handleDesktopPointerMove = (event) => {
    if (!selectionBox || activeSelectionPointer.current !== event.pointerId) {
      return;
    }

    const nextSelectionBox = {
      ...selectionBox,
      currentX: event.clientX,
      currentY: event.clientY,
    };
    const nextRect = getSelectionRect(nextSelectionBox);

    setSelectionBox(nextSelectionBox);

    if (nextRect.width > selectionThreshold || nextRect.height > selectionThreshold) {
      setSelectedIds(getSelectedIconIdsInRect(nextRect));
    }
  };

  const finishDesktopSelection = (event) => {
    if (!selectionBox || activeSelectionPointer.current !== event.pointerId) {
      return;
    }

    const finalRect = getSelectionRect(selectionBox);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    suppressNextDesktopClick.current = finalRect.width > selectionThreshold || finalRect.height > selectionThreshold;
    activeSelectionPointer.current = null;
    setSelectionBox(null);
  };

  /* ---- Multi-window helpers ---- */
  const focusWindow = useCallback((windowId) => {
    const z = nextZ();
    setOpenWindows(prev => prev.map(w =>
      w.id === windowId ? { ...w, zIndex: z } : w
    ));
  }, [nextZ]);

  const openItem = (item) => {
    setSelectedIds([item.id]);
    setIsStartOpen(false);

    if (item.kind === 'external') {
      if (item.href.startsWith('mailto:')) {
        window.location.assign(item.href);
        return;
      }

      window.open(item.href, '_blank', 'noopener,noreferrer');
      return;
    }

    if (isMobile) {
      setMobileAppId(item.id);
      setMobileMinimized(false);
      return;
    }

    setOpenWindows(prev => {
      const existing = prev.find(w => w.id === item.id);
      if (existing) {
        // already open — bring to front and un-minimize
        const z = nextZ();
        return prev.map(w =>
          w.id === item.id ? { ...w, isMinimized: false, zIndex: z } : w
        );
      }
      // open new window
      return [...prev, { id: item.id, isMaximized: false, isMinimized: false, zIndex: nextZ() }];
    });
  };

  const closeWindow = useCallback((windowId) => {
    setOpenWindows(prev => prev.filter(w => w.id !== windowId));
  }, []);

  const minimizeWindow = useCallback((windowId) => {
    setOpenWindows(prev => prev.map(w =>
      w.id === windowId ? { ...w, isMinimized: true } : w
    ));
  }, []);

  const toggleMaximizeWindow = useCallback((windowId) => {
    setOpenWindows(prev => prev.map(w =>
      w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  }, []);

  const toggleMinimizeFromTaskbar = useCallback((windowId) => {
    setOpenWindows(prev => {
      const win = prev.find(w => w.id === windowId);
      if (!win) return prev;
      if (win.isMinimized) {
        // restore and bring to front
        const z = nextZ();
        return prev.map(w =>
          w.id === windowId ? { ...w, isMinimized: false, zIndex: z } : w
        );
      }
      // check if it's already the topmost — if so, minimize it; otherwise focus it
      const maxZ = Math.max(...prev.map(w => w.zIndex));
      if (win.zIndex === maxZ) {
        return prev.map(w =>
          w.id === windowId ? { ...w, isMinimized: true } : w
        );
      }
      const z = nextZ();
      return prev.map(w =>
        w.id === windowId ? { ...w, zIndex: z } : w
      );
    });
  }, [nextZ]);

  return (
    <div
      ref={desktopRef}
      className="win7-desktop"
      style={{ '--desktop-wallpaper-url': `url(${wallpaper})` }}
      onPointerDown={handleDesktopPointerDown}
      onPointerMove={handleDesktopPointerMove}
      onPointerUp={finishDesktopSelection}
      onPointerCancel={finishDesktopSelection}
      onClick={(event) => {
        if (suppressNextDesktopClick.current) {
          suppressNextDesktopClick.current = false;
          return;
        }

        if (event.target.classList.contains('win7-desktop')) {
          setSelectedIds([]);
          setIsStartOpen(false);
        }
      }}
    >
      <div className="desktop-sheen" aria-hidden="true"></div>

      {isSelectionVisible && (
        <div
          className="desktop-selection-marquee"
          style={{
            left: `${activeSelectionRect.left}px`,
            top: `${activeSelectionRect.top}px`,
            width: `${activeSelectionRect.width}px`,
            height: `${activeSelectionRect.height}px`,
          }}
          aria-hidden="true"
        />
      )}

      <main className="desktop-stage">
        <div className="desktop-icons" aria-label="Portfolio desktop shortcuts">
          {desktopItems.map(item => (
            <DesktopIcon
              key={item.id}
              item={item}
              isSelected={selectedIds.includes(item.id)}
              onSelect={(id) => setSelectedIds([id])}
              onOpen={openItem}
            />
          ))}
        </div>

        <aside className="desktop-widgets" aria-label="Desktop widgets">
          <section className="desktop-profile-widget glass-widget">
            <div className="desktop-profile-orb" aria-hidden="true">
              <span>HH</span>
            </div>
            <div>
              <p className="desktop-kicker">Software Engineer</p>
              <h1>Hasan Haider</h1>
              <p>Frontend performance, AI tooling, and cybersecurity with a portfolio built like a tiny operating system.</p>
            </div>
          </section>

          <section className="glass-widget widget-clock">
            <DualClock />
          </section>

          <section className="glass-widget widget-stats">
            <SystemStats />
          </section>

          <section className="glass-widget widget-colors">
            <ColorSwitcher
              theme={theme}
              colors={themeColors}
              onColorsChange={setThemeColors}
              wheelSize={92}
            />
          </section>
        </aside>
      </main>

      {/* ---- Windows ---- */}
      {isMobile ? (
        /* Mobile: single-window, no drag/resize */
        (() => {
          const mobileApp = internalApps.find(a => a.id === mobileAppId);
          if (!mobileApp || mobileMinimized) return null;
          return (
            <div className="desktop-window-layer">
              <BrowserWindow
                app={mobileApp}
                isMaximized={mobileMaximized}
                isMobile
                onClose={() => { setMobileAppId(null); setMobileMinimized(false); setMobileMaximized(false); }}
                onMinimize={() => setMobileMinimized(true)}
                onToggleMaximize={() => setMobileMaximized(prev => !prev)}
                theme={theme}
                themeColors={themeColors}
                onThemeColorsChange={setThemeColors}
              />
            </div>
          );
        })()
      ) : (
        /* Desktop: multi-window with drag/resize */
        <div className="desktop-window-layer">
          {openWindows.map(win => {
            const app = internalApps.find(a => a.id === win.id);
            if (!app || win.isMinimized) return null;
            return (
              <BrowserWindow
                key={win.id}
                app={app}
                isMaximized={win.isMaximized}
                isMobile={false}
                zIndex={win.zIndex}
                onFocus={() => focusWindow(win.id)}
                onClose={() => closeWindow(win.id)}
                onMinimize={() => minimizeWindow(win.id)}
                onToggleMaximize={() => toggleMaximizeWindow(win.id)}
                theme={theme}
                themeColors={themeColors}
                onThemeColorsChange={setThemeColors}
              />
            );
          })}
        </div>
      )}

      <nav className="win7-taskbar" aria-label="Desktop taskbar">
        <div className="taskbar-left">
          <button
            type="button"
            className={`start-orb ${isStartOpen ? 'active' : ''}`}
            aria-label="Open start menu"
            onClick={() => setIsStartOpen(prev => !prev)}
          >
            <Power size={22} />
          </button>

          {isStartOpen && (
            <div className="start-menu">
              <div className="start-menu-user">
                <span className="start-avatar">HH</span>
                <div>
                  <strong>Hasan Haider</strong>
                  <span>Portfolio Desktop</span>
                </div>
              </div>
              <div className="start-menu-list">
                {desktopItems.slice(0, 6).map(item => (
                  <button type="button" key={item.id} onClick={() => openItem(item)}>
                    <span className={`start-menu-icon ${item.accent}`}>{item.icon}</span>
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isMobile ? (
            /* Mobile: single taskbar button */
            (() => {
              const mobileApp = internalApps.find(a => a.id === mobileAppId);
              if (!mobileApp) return null;
              return (
                <button
                  type="button"
                  className={`taskbar-app ${mobileMinimized ? 'minimized' : 'active'}`}
                  onClick={() => setMobileMinimized(prev => !prev)}
                >
                  <span className={`taskbar-app-icon ${mobileApp.accent}`}>{mobileApp.icon}</span>
                  <span>{mobileApp.title}</span>
                </button>
              );
            })()
          ) : (
            /* Desktop: taskbar button per open window */
            openWindows.map(win => {
              const app = internalApps.find(a => a.id === win.id);
              if (!app) return null;
              const topZ = Math.max(...openWindows.map(w => w.zIndex));
              const isFocused = !win.isMinimized && win.zIndex === topZ;
              return (
                <button
                  type="button"
                  key={win.id}
                  className={`taskbar-app ${win.isMinimized ? 'minimized' : isFocused ? 'active' : ''}`}
                  onClick={() => toggleMinimizeFromTaskbar(win.id)}
                >
                  <span className={`taskbar-app-icon ${app.accent}`}>{app.icon}</span>
                  <span>{app.title}</span>
                </button>
              );
            })
          )}

          <button type="button" className="taskbar-theme" onClick={toggleTheme}>
            {theme === 'dark' ? 'Dark' : 'Light'}
          </button>
        </div>

        <TaskbarClock />
      </nav>
    </div>
  );
};

export default DesktopShell;

