import { useEffect, useRef } from 'react';
import { desktopLayoutStorageKey, desktopLayoutVersion } from './desktopUtils';

const saveLayout = (pending) => {
  if (!pending.current) return;
  window.localStorage.setItem(desktopLayoutStorageKey, JSON.stringify(pending.current));
  pending.current = null;
};

export default function useLayoutPersistence({ iconPositions, widgetRects, isStatsExpanded, isMobile }) {
  const pending = useRef(null);

  useEffect(() => {
    if (isMobile || !Object.keys(iconPositions).length || !Object.keys(widgetRects).length) return;

    pending.current = {
      version: desktopLayoutVersion,
      icons: iconPositions,
      widgets: widgetRects,
      statsExpanded: isStatsExpanded,
    };
    const timer = window.setTimeout(() => saveLayout(pending), 250);
    return () => window.clearTimeout(timer);
  }, [iconPositions, widgetRects, isStatsExpanded, isMobile]);

  useEffect(() => {
    const flush = () => saveLayout(pending);
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, []);
}
