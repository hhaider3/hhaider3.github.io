import { lazy, Suspense, useEffect, useState } from 'react';
import DesktopShell from './components/DesktopShell';

const PhoneSensorClient = lazy(() => import('./components/MotionLab').then(module => ({
  default: module.PhoneSensorClient,
})));

const readHashRoute = () => {
  const hash = window.location.hash.replace(/^#/, '');
  const [path = '', query = ''] = hash.split('?');

  return {
    path,
    params: new URLSearchParams(query),
  };
};

const isPhoneMode = (params) => (
  params.get('m') === 'p'
  || params.get('motion') === 'phone'
);

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme || (systemPrefersDark ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const searchParams = new URLSearchParams(window.location.search);
  const hashRoute = readHashRoute();
  const isPhoneSensorClient = (
    window.location.pathname === '/motion-phone'
    || window.location.pathname.startsWith('/motion-phone/')
    || hashRoute.path === '/motion-phone'
    || hashRoute.path.startsWith('/motion-phone/')
    || isPhoneMode(searchParams)
    || isPhoneMode(hashRoute.params)
  );

  return isPhoneSensorClient
    ? (
      <Suspense fallback={<div style={{ padding: '24px' }}>Loading...</div>}>
        <PhoneSensorClient />
      </Suspense>
    )
    : <DesktopShell theme={theme} toggleTheme={toggleTheme} />;
}

export default App;
