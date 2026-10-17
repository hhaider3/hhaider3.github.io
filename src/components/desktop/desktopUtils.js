import { WALLPAPER_COLOR_DEFAULTS } from '../../constants/colors';
import { readStorage } from '../../utils/storage';

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
export const statsCollapsedWidgetHeight = 194;
export const statsExpandedWidgetHeight = 330;
export const widgetMinimums = {
  clock: { w: 260, h: 132 },
  stats: { w: 250, h: statsCollapsedWidgetHeight },
  colors: { w: 260, h: 260 },
};
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
  'earth-orbit-live',
  'macmpv',
  'stockfish-board',
  'endless-drive',
  'terminal-breach',
];

export const getInitialThemeColors = () => {
  if (typeof window === 'undefined') {
    return WALLPAPER_COLOR_DEFAULTS;
  }

  const savedColors = readStorage(colorStorageKey);
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

// Widgets may touch but never overlap.
export const doWidgetRectsOverlap = (a, b) => (
  a.x < b.x + b.w
  && a.x + a.w > b.x
  && a.y < b.y + b.h
  && a.y + a.h > b.y
);

const overlapsAny = (rect, others) => others.some(other => doWidgetRectsOverlap(rect, other));

const isWidgetRectInViewport = (rect) => (
  rect.x >= desktopMargin - 0.5
  && rect.y >= desktopMargin - 0.5
  && rect.x + rect.w <= window.innerWidth - desktopMargin + 0.5
  && rect.y + rect.h <= window.innerHeight - desktopTaskbarHeight - desktopMargin + 0.5
);

// Nearest in-viewport spot for `rect` that doesn't overlap `blockers`. Candidate
// edges come from the viewport bounds and from lining up beside each blocker.
const findFreeWidgetSpot = (rect, blockers) => {
  const maxX = window.innerWidth - desktopMargin - rect.w;
  const maxY = window.innerHeight - desktopTaskbarHeight - desktopMargin - rect.h;
  const xs = new Set([rect.x, desktopMargin, maxX]);
  const ys = new Set([rect.y, desktopMargin, maxY]);

  blockers.forEach((other) => {
    xs.add(other.x);
    xs.add(other.x - rect.w - widgetStackGap);
    xs.add(other.x + other.w + widgetStackGap);
    ys.add(other.y);
    ys.add(other.y - rect.h - widgetStackGap);
    ys.add(other.y + other.h + widgetStackGap);
  });

  let best = null;
  let bestDistance = Infinity;

  xs.forEach((x) => {
    ys.forEach((y) => {
      const candidate = { ...rect, x, y };
      if (!isWidgetRectInViewport(candidate) || overlapsAny(candidate, blockers)) {
        return;
      }

      const distance = (x - rect.x) ** 2 + (y - rect.y) ** 2;
      if (distance < bestDistance) {
        best = candidate;
        bestDistance = distance;
      }
    });
  });

  return best;
};

export const desktopIconSize = 96;

export const getIconRects = (iconPositions = {}) => Object.values(iconPositions)
  .map(({ x, y }) => ({ x, y, w: desktopIconSize, h: desktopIconSize }));

// Clamp every widget into the viewport and move any that overlap another
// widget to the nearest free spot, preferring spots that leave the desktop
// icons uncovered. `anchorIds` are placed first so they keep their position.
export const packWidgetRects = (rects, { anchorIds = [], iconRects = [] } = {}) => {
  if (typeof window === 'undefined') {
    return rects;
  }

  const ids = [
    ...anchorIds.filter(id => rects[id]),
    ...Object.keys(rects).filter(id => !anchorIds.includes(id)),
  ];
  const placed = [];
  const packed = {};

  ids.forEach((id) => {
    const rect = clampWidgetRect(rects[id], id);
    let next = rect;

    if (overlapsAny(rect, placed)) {
      const min = widgetMinimums[id] || rect;
      const minRect = { ...rect, w: min.w, h: min.h };
      const placedAndIcons = [...placed, ...iconRects];
      // Shrinking to the minimum size beats covering icons; covering icons
      // beats overlapping another widget.
      next = findFreeWidgetSpot(rect, placedAndIcons)
        || findFreeWidgetSpot(minRect, placedAndIcons)
        || findFreeWidgetSpot(rect, placed)
        || findFreeWidgetSpot(minRect, placed)
        || rect;
    }

    packed[id] = next;
    placed.push(next);
  });

  return packed;
};

// Slide `current` toward `target` along one axis, stopping flush against any
// widget in the way.
const sweepWidgetAxis = (current, targetValue, axis, others) => {
  const [pos, size, crossPos, crossSize] = axis === 'x' ? ['x', 'w', 'y', 'h'] : ['y', 'h', 'x', 'w'];
  let next = targetValue;

  others.forEach((other) => {
    const crossesPath = current[crossPos] < other[crossPos] + other[crossSize]
      && current[crossPos] + current[crossSize] > other[crossPos];
    if (!crossesPath) {
      return;
    }

    if (next > current[pos] && other[pos] >= current[pos] + current[size]) {
      next = Math.min(next, other[pos] - current[size]);
    }
    if (next < current[pos] && other[pos] + other[size] <= current[pos]) {
      next = Math.max(next, other[pos] + other[size]);
    }
  });

  return { ...current, [pos]: next };
};

export const moveWidgetWithoutOverlap = (current, target, others) => {
  // A widget that already overlaps (e.g. an old saved layout) moves freely so it can be dragged clear.
  if (overlapsAny(current, others)) {
    return target;
  }

  // Follow the pointer whenever its spot is clear, even past another widget.
  if (!overlapsAny(target, others)) {
    return target;
  }

  // Try both axis orders and keep whichever lands closer to the pointer, so a
  // diagonal drag slides around a corner instead of snagging on it.
  const distanceToTarget = rect => (rect.x - target.x) ** 2 + (rect.y - target.y) ** 2;
  const candidates = [
    sweepWidgetAxis(sweepWidgetAxis(current, target.x, 'x', others), target.y, 'y', others),
    sweepWidgetAxis(sweepWidgetAxis(current, target.y, 'y', others), target.x, 'x', others),
  ].filter(rect => !overlapsAny(rect, others));

  if (!candidates.length) {
    return current;
  }

  return candidates.reduce((best, rect) => (distanceToTarget(rect) < distanceToTarget(best) ? rect : best));
};

export const resizeWidgetWithoutOverlap = (current, target, others) => {
  if (overlapsAny(current, others)) {
    return target;
  }

  let { w, h } = target;

  others.forEach((other) => {
    const sharesRows = current.y < other.y + other.h && current.y + current.h > other.y;
    if (sharesRows && w > current.w && other.x >= current.x + current.w) {
      w = Math.min(w, other.x - current.x);
    }
  });

  others.forEach((other) => {
    const sharesColumns = current.x < other.x + other.w && current.x + w > other.x;
    if (sharesColumns && h > current.h && other.y >= current.y + current.h) {
      h = Math.min(h, other.y - current.y);
    }
  });

  const next = { ...target, w, h };
  return overlapsAny(next, others) ? current : next;
};

export const loadDesktopLayout = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const savedLayout = JSON.parse(readStorage(desktopLayoutStorageKey));
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
      desktopIconSize,
      desktopIconSize
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

    if (id === 'stats') {
      rect = {
        ...rect,
        h: Math.max(
          rect.h || 0,
          isStatsExpanded ? statsExpandedWidgetHeight : statsCollapsedWidgetHeight
        ),
      };
    }

    nextRects[id] = clampWidgetRect(rect, id);
    return nextRects;
  }, {});

  if (!isStatsExpanded || !rects.stats) {
    return packWidgetRects(rects, { iconRects: getIconRects(getInitialIconPositions()) });
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

  return packWidgetRects(rects, {
    anchorIds: ['stats'],
    iconRects: getIconRects(getInitialIconPositions()),
  });
};
