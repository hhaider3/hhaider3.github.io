import BrowserWindow from './BrowserWindow';

const WindowLayer = ({
  closeWindow,
  focusWindow,
  internalApps,
  isMobile,
  mobileAppId,
  mobileMaximized,
  mobileMinimized,
  mobileMinimizeRequestId,
  mobileOpenOrigin,
  minimizeWindow,
  openWindows,
  setMobileAppId,
  setMobileMaximized,
  setMobileMinimized,
  setMobileMinimizeRequestId,
  setMobileOpenOrigin,
  setThemeColors,
  theme,
  themeColors,
  toggleMaximizeWindow,
}) => {
  if (isMobile) {
    const mobileApp = internalApps.find(a => a.id === mobileAppId);
    if (!mobileApp || mobileMinimized) return null;

    return (
      <div className="desktop-window-layer">
        <BrowserWindow
          key={mobileApp.id}
          app={mobileApp}
          isMaximized={mobileMaximized}
          isMobile
          openOrigin={mobileOpenOrigin}
          minimizeRequestId={mobileMinimizeRequestId}
          onClose={() => {
            setMobileAppId(null);
            setMobileMinimized(false);
            setMobileMaximized(false);
            setMobileOpenOrigin(null);
            setMobileMinimizeRequestId(0);
          }}
          onMinimize={() => {
            setMobileOpenOrigin(null);
            setMobileMinimized(true);
          }}
          onToggleMaximize={() => setMobileMaximized(prev => !prev)}
          theme={theme}
          themeColors={themeColors}
          onThemeColorsChange={setThemeColors}
        />
      </div>
    );
  }

  return (
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
            openOrigin={win.openOrigin}
            minimizeRequestId={win.minimizeRequestId}
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
  );
};

export default WindowLayer;
