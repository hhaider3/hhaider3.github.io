import { useEffect, useMemo, useState } from 'react';
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

const BrowserWindow = ({
  app,
  isMaximized,
  onClose,
  onMinimize,
  onToggleMaximize,
  theme,
  themeColors,
  onThemeColorsChange
}) => {
  const [isColorPanelOpen, setIsColorPanelOpen] = useState(false);
  const Content = app.component;

  return (
    <section className={`portfolio-window ${isMaximized ? 'maximized' : ''}`} aria-label={`${app.title} window`}>
      <div className="window-frame-glow" aria-hidden="true"></div>

      <div className="window-titlebar">
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

const DesktopShell = ({ theme, toggleTheme }) => {
  const [selectedId, setSelectedId] = useState('about');
  const [activeAppId, setActiveAppId] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [themeColors, setThemeColors] = useState(getInitialThemeColors);

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

  const activeApp = internalApps.find(app => app.id === activeAppId);

  const openItem = (item) => {
    setSelectedId(item.id);
    setIsStartOpen(false);

    if (item.kind === 'external') {
      if (item.href.startsWith('mailto:')) {
        window.location.assign(item.href);
        return;
      }

      window.open(item.href, '_blank', 'noopener,noreferrer');
      return;
    }

    setActiveAppId(item.id);
    setIsMinimized(false);
  };

  const closeWindow = () => {
    setActiveAppId(null);
    setIsMinimized(false);
    setIsMaximized(false);
  };

  const activeTaskbarItem = activeApp && (
    <button
      type="button"
      className={`taskbar-app ${isMinimized ? 'minimized' : 'active'}`}
      onClick={() => setIsMinimized(prev => !prev)}
    >
      <span className={`taskbar-app-icon ${activeApp.accent}`}>{activeApp.icon}</span>
      <span>{activeApp.title}</span>
    </button>
  );

  return (
    <div
      className="win7-desktop"
      style={{ '--desktop-wallpaper-url': `url(${wallpaper})` }}
      onClick={(event) => {
        if (event.target.classList.contains('win7-desktop')) {
          setSelectedId(null);
          setIsStartOpen(false);
        }
      }}
    >
      <div className="desktop-sheen" aria-hidden="true"></div>

      <main className="desktop-stage">
        <div className="desktop-icons" aria-label="Portfolio desktop shortcuts">
          {desktopItems.map(item => (
            <DesktopIcon
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
              onSelect={setSelectedId}
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

      {activeApp && !isMinimized && (
        <div className="desktop-window-layer">
          <BrowserWindow
            app={activeApp}
            isMaximized={isMaximized}
            onClose={closeWindow}
            onMinimize={() => setIsMinimized(true)}
            onToggleMaximize={() => setIsMaximized(prev => !prev)}
            theme={theme}
            themeColors={themeColors}
            onThemeColorsChange={setThemeColors}
          />
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

          {activeTaskbarItem}

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
