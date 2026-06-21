import { useEffect, useState } from 'react';
import { Power } from 'lucide-react';

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

const Taskbar = ({
  desktopItems,
  internalApps,
  isMobile,
  isStartOpen,
  mobileAppId,
  mobileMinimized,
  openItem,
  openWindows,
  resetDesktopLayout,
  setIsStartOpen,
  theme,
  toggleMinimizeFromTaskbar,
  toggleMobileMinimizeFromTaskbar,
  toggleTheme,
}) => (
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
        (() => {
          const mobileApp = internalApps.find(a => a.id === mobileAppId);
          if (!mobileApp) return null;
          return (
            <button
              type="button"
              data-taskbar-id={mobileApp.id}
              className={`taskbar-app ${mobileMinimized ? 'minimized' : 'active'}`}
              onClick={toggleMobileMinimizeFromTaskbar}
            >
              <span className={`taskbar-app-icon ${mobileApp.accent}`}>{mobileApp.icon}</span>
              <span>{mobileApp.title}</span>
            </button>
          );
        })()
      ) : (
        openWindows.map(win => {
          const app = internalApps.find(a => a.id === win.id);
          if (!app) return null;
          const topZ = Math.max(...openWindows.map(w => w.zIndex));
          const isFocused = !win.isMinimized && win.zIndex === topZ;
          return (
            <button
              type="button"
              key={win.id}
              data-taskbar-id={win.id}
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

      <button type="button" className="taskbar-reset" onClick={resetDesktopLayout}>
        Reset Layout
      </button>
    </div>

    <TaskbarClock />
  </nav>
);

export default Taskbar;
