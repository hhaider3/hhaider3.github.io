import { WALLPAPER_COLOR_DEFAULTS } from '../../constants/colors';

export const colorStorageKey = 'portfolioThemeColors';
export const desktopLayoutStorageKey = 'portfolioDesktopLayout';
export const desktopLayoutVersion = 2;
export const selectionThreshold = 4;
export const iconDragThreshold = 5;
export const desktopTaskbarHeight = 56;
export const desktopMargin = 12;
export const widgetStackGap = 10;
export const widgetResizeEdges = ['e', 's', 'se'];
export const widgetLabels = {
  clock: 'Clock',
  stats: 'System',
  colors: 'Colors',
};
export const widgetMinimums = {
  clock: { w: 260, h: 132 },
  stats: { w: 250, h: 150 },
  colors: { w: 260, h: 260 },
};
export const statsCollapsedWidgetHeight = 182;
export const statsExpandedWidgetHeight = 318;
export const desktopIconOrder = [
  'about',
  'experience',
  'projects',
  'skills',
  'publications',
  'contact',
  'cv',
  'github',
  'linkedin',
  'globe',
  'motion',
];

export const getInitialThemeColors = () => {
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
        ...(parsedColors.dark || {}),
      },
      light: {
        ...WALLPAPER_COLOR_DEFAULTS.light,
        ...(parsedColors.light || {}),
      },
    };
  } catch {
    return WALLPAPER_COLOR_DEFAULTS;
  }
};

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const getSelectionRect = ({ startX, startY, currentX, currentY }) => ({
  left: Math.min(startX, currentX),
  top: Math.min(startY, currentY),
  width: Math.abs(currentX - startX),
  height: Math.abs(currentY - startY),
});

export const doesRectIntersect = (a, b) => (
  a.left < b.right
  && a.left + a.width > b.left
  && a.top < b.bottom
  && a.top + a.height > b.top
);

export const getDefaultIconPosition = (index) => {
  const rows = 5;
  const col = Math.floor(index / rows);
  const row = index % rows;
  return {
    x: 34 + col * 110,
    y: 16 + row * 104,
  };
};

export const getDefaultWidgetRects = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  const w = 430;
  const x = Math.max(desktopMargin, window.innerWidth - 34 - w);

  return {
    clock: { x, y: 16, w, h: 142 },
    stats: { x, y: 168, w, h: statsCollapsedWidgetHeight },
    colors: { x, y: 360, w, h: 278 },
  };
};

export const clampDesktopPoint = ({ x, y }, width, height) => {
  if (typeof window === 'undefined') {
    return { x, y };
  }

  return {
    x: clamp(x, desktopMargin, window.innerWidth - width - desktopMargin),
    y: clamp(y, desktopMargin, window.innerHeight - desktopTaskbarHeight - height - desktopMargin),
  };
};

export const clampWidgetRect = (rect, id) => {
  if (typeof window === 'undefined') {
    return rect;
  }

  const min = widgetMinimums[id] || { w: 220, h: 120 };
  const maxW = Math.max(min.w, window.innerWidth - desktopMargin * 2);
  const maxH = Math.max(min.h, window.innerHeight - desktopTaskbarHeight - desktopMargin * 2);
  const w = clamp(rect.w, min.w, maxW);
  const h = clamp(rect.h, min.h, maxH);
  const point = clampDesktopPoint({ x: rect.x, y: rect.y }, w, h);

  return { ...point, w, h };
};

export const loadDesktopLayout = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const savedLayout = JSON.parse(window.localStorage.getItem(desktopLayoutStorageKey));
    return savedLayout?.version === desktopLayoutVersion ? savedLayout : null;
  } catch {
    return null;
  }
};

const getSavedStatsExpanded = (savedLayout) => {
  if (typeof savedLayout?.statsExpanded === 'boolean') {
    return savedLayout.statsExpanded;
  }

  const savedStatsHeight = savedLayout?.widgets?.stats?.h;
  const legacyExpandedThreshold = (statsCollapsedWidgetHeight + statsExpandedWidgetHeight) / 2;

  return Number.isFinite(savedStatsHeight) && savedStatsHeight >= legacyExpandedThreshold;
};

export const getInitialStatsExpanded = () => getSavedStatsExpanded(loadDesktopLayout());

export const getInitialIconPositions = () => {
  const savedLayout = loadDesktopLayout();
  return desktopIconOrder.reduce((positions, id, index) => {
    positions[id] = clampDesktopPoint(
      savedLayout?.icons?.[id] || getDefaultIconPosition(index),
      96,
      96
    );
    return positions;
  }, {});
};

export const getInitialWidgetRects = () => {
  const savedLayout = loadDesktopLayout();
  const defaultWidgets = getDefaultWidgetRects();
  const isStatsExpanded = getSavedStatsExpanded(savedLayout);

  const rects = Object.keys(defaultWidgets).reduce((nextRects, id) => {
    let rect = savedLayout?.widgets?.[id] || defaultWidgets[id];

    if (id === 'stats' && isStatsExpanded) {
      rect = {
        ...rect,
        h: Math.max(rect.h || 0, statsExpandedWidgetHeight),
      };
    }

    nextRects[id] = clampWidgetRect(rect, id);
    return nextRects;
  }, {});

  if (!isStatsExpanded || !rects.stats) {
    return rects;
  }

  const statsRect = rects.stats;
  const minimumStackedY = statsRect.y + statsRect.h + widgetStackGap;

  Object.keys(rects).forEach((id) => {
    if (id === 'stats') {
      return;
    }

    const rect = rects[id];
    const horizontallyOverlapsStats = (
      rect.x < statsRect.x + statsRect.w
      && rect.x + rect.w > statsRect.x
    );
    const isBelowStatsTop = rect.y >= statsRect.y + widgetStackGap;

    if (horizontallyOverlapsStats && isBelowStatsTop && rect.y < minimumStackedY) {
      rects[id] = clampWidgetRect({ ...rect, y: minimumStackedY }, id);
    }
  });

  return rects;
};
