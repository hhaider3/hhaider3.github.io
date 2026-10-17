import { lazy, Suspense, useEffect, useState } from 'react';
import AppErrorBoundary from './components/desktop/AppErrorBoundary';
import { readStorage, writeStorage } from './utils/storage';
const DesktopShell = lazy(() => import('./components/DesktopShell'));
const PhoneSensorClient = lazy(() => import('./components/motion/PhoneSensorClient'));

const readHashRoute = () => {
  const hash = window.location.hash.replace(/^#/, '');
  const [path = '', query = ''] = hash.split('?');

  return {
    path,
    params: new URLSearchParams(query),
  };
};

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = readStorage('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme || (systemPrefersDark ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    writeStorage('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const hashRoute = readHashRoute();
  const isPhoneSensorClient = (
    window.location.pathname === '/motion-phone'
    || window.location.pathname.startsWith('/motion-phone/')
    || hashRoute.path === '/motion-phone'
    || hashRoute.path.startsWith('/motion-phone/')
  );

  return (
    <AppErrorBoundary title="The portfolio" hint="Something went wrong while loading the page. Try again, or reload.">
      <Suspense fallback={<div style={{ padding: '24px' }}>Loading...</div>}>
        {isPhoneSensorClient
          ? <PhoneSensorClient />
          : <DesktopShell theme={theme} toggleTheme={toggleTheme} />}
      </Suspense>
    </AppErrorBoundary>
  );
}

export default App;
