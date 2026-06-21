import { useCallback, useEffect, useRef, useState } from 'react';
import DesktopStage from './desktop/DesktopStage';
import Taskbar from './desktop/Taskbar';
import WindowLayer from './desktop/WindowLayer';
import useDesktopApps from './desktop/useDesktopApps';
import useDesktopWidgets from './desktop/useDesktopWidgets';
import useIsMobile from './desktop/useIsMobile';
import {
  clampDesktopPoint,
  clampWidgetRect,
  colorStorageKey,
  desktopLayoutStorageKey,
  desktopLayoutVersion,
  doesRectIntersect,
  getDefaultIconPosition,
  getDefaultWidgetRects,
  getInitialIconPositions,
  getInitialThemeColors,
  getInitialWidgetRects,
  getSelectionRect,
  iconDragThreshold,
  selectionThreshold,
  statsCollapsedWidgetHeight,
  statsExpandedWidgetHeight,
} from './desktop/desktopUtils';
import wallpaper from '../assets/win7-portfolio-wallpaper.png';

const DesktopShell = ({ theme, toggleTheme }) => {
  const isMobile = useIsMobile();
  const { desktopItems, internalApps } = useDesktopApps();
  const desktopRef = useRef(null);
  const activeSelectionPointer = useRef(null);
  const activeDesktopDrag = useRef(null);
  const suppressNextDesktopClick = useRef(false);
  const suppressIconClick = useRef(null);
  const zCounterRef = useRef(1);
  const widgetZCounterRef = useRef(3);
  const [selectedIds, setSelectedIds] = useState(['about']);
  const [selectionBox, setSelectionBox] = useState(null);
  const [iconPositions, setIconPositions] = useState(getInitialIconPositions);
  const [widgetRects, setWidgetRects] = useState(getInitialWidgetRects);
  const [widgetZIndexes, setWidgetZIndexes] = useState({ clock: 1, stats: 2, colors: 3 });
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [themeColors, setThemeColors] = useState(getInitialThemeColors);

  const [mobileAppId, setMobileAppId] = useState(null);
  const [mobileMaximized, setMobileMaximized] = useState(false);
  const [mobileMinimized, setMobileMinimized] = useState(false);
  const [mobileOpenOrigin, setMobileOpenOrigin] = useState(null);
  const [mobileMinimizeRequestId, setMobileMinimizeRequestId] = useState(0);

  const [openWindows, setOpenWindows] = useState([]);

  const nextZ = useCallback(() => ++zCounterRef.current, []);
  const nextWidgetZ = useCallback(() => ++widgetZCounterRef.current, []);

  useEffect(() => {
    window.localStorage.setItem(colorStorageKey, JSON.stringify(themeColors));
  }, [themeColors]);

  const handleStatsExpandedChange = useCallback((nextExpanded) => {
    setIsStatsExpanded(nextExpanded);

    if (isMobile) {
      return;
    }

    setWidgetRects((prev) => {
      const current = prev.stats || getDefaultWidgetRects().stats;
      const nextHeight = nextExpanded ? statsExpandedWidgetHeight : statsCollapsedWidgetHeight;

      return {
        ...prev,
        stats: clampWidgetRect({ ...current, h: nextHeight }, 'stats'),
      };
    });

    if (nextExpanded) {
      setWidgetZIndexes(prev => ({ ...prev, stats: nextWidgetZ() }));
    }
  }, [isMobile, nextWidgetZ]);

  const widgets = useDesktopWidgets({
    handleStatsExpandedChange,
    isStatsExpanded,
    setThemeColors,
    theme,
    themeColors,
  });

  useEffect(() => {
    if (isMobile || Object.keys(iconPositions).length === 0 || Object.keys(widgetRects).length === 0) {
      return;
    }

    window.localStorage.setItem(desktopLayoutStorageKey, JSON.stringify({
      version: desktopLayoutVersion,
      icons: iconPositions,
      widgets: widgetRects,
    }));
  }, [iconPositions, isMobile, widgetRects]);

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

  const shouldBlockWidgetDrag = (target) => {
    if (!(target instanceof Element)) {
      return true;
    }

    return !!target.closest(
      'button, a, input, textarea, select, canvas, .desktop-widget-resize-handle, .cs-wheel-wrapper, .cs-slider, .sys-stats-toggle, .widget-info-popover'
    );
  };

  const handleIconPointerDown = (event, item) => {
    if (isMobile || event.button !== 0 || event.pointerType === 'touch') {
      return;
    }

    const position = iconPositions[item.id] || getDefaultIconPosition(desktopItems.findIndex(entry => entry.id === item.id));
    event.currentTarget.setPointerCapture(event.pointerId);
    activeDesktopDrag.current = {
      type: 'icon',
      id: item.id,
      pointerId: event.pointerId,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startX: position.x,
      startY: position.y,
      moved: false,
    };
    setSelectedIds([item.id]);
    setIsStartOpen(false);
  };

  const handleIconPointerMove = (event) => {
    const drag = activeDesktopDrag.current;
    if (!drag || drag.type !== 'icon' || drag.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - drag.startMouseX;
    const dy = event.clientY - drag.startMouseY;
    const moved = drag.moved || Math.abs(dx) > iconDragThreshold || Math.abs(dy) > iconDragThreshold;

    if (!moved) {
      return;
    }

    event.preventDefault();
    drag.moved = true;
    const nextPoint = clampDesktopPoint({
      x: drag.startX + dx,
      y: drag.startY + dy,
    }, 96, 96);

    setIconPositions(prev => ({
      ...prev,
      [drag.id]: nextPoint,
    }));
  };

  const finishIconDrag = (event) => {
    const drag = activeDesktopDrag.current;
    if (!drag || drag.type !== 'icon' || drag.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (drag.moved) {
      suppressIconClick.current = drag.id;
    }

    activeDesktopDrag.current = null;
  };

  const consumeSuppressedIconClick = (id) => {
    if (suppressIconClick.current !== id) {
      return false;
    }

    suppressIconClick.current = null;
    return true;
  };

  const startWidgetResize = (event, widgetId, edge, rect) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);

    const resizeState = {
      type: 'widget-resize',
      id: widgetId,
      edge,
      pointerId: event.pointerId,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startX: rect.x,
      startY: rect.y,
      startW: rect.w,
      startH: rect.h,
    };
    activeDesktopDrag.current = resizeState;

    const onMove = (moveEvent) => {
      if (moveEvent.pointerId !== resizeState.pointerId) {
        return;
      }

      const dx = moveEvent.clientX - resizeState.startMouseX;
      const dy = moveEvent.clientY - resizeState.startMouseY;
      let nextRect = {
        x: resizeState.startX,
        y: resizeState.startY,
        w: resizeState.startW,
        h: resizeState.startH,
      };

      if (resizeState.edge.includes('e')) {
        nextRect.w = resizeState.startW + dx;
      }
      if (resizeState.edge.includes('s')) {
        nextRect.h = resizeState.startH + dy;
      }

      nextRect = clampWidgetRect(nextRect, resizeState.id);
      setWidgetRects(prev => ({
        ...prev,
        [resizeState.id]: nextRect,
      }));
    };

    const onUp = (upEvent) => {
      if (upEvent.pointerId !== resizeState.pointerId) {
        return;
      }

      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      activeDesktopDrag.current = null;
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const handleWidgetPointerDown = (event, widgetId) => {
    if (isMobile || event.button !== 0 || event.pointerType === 'touch') {
      return;
    }

    if (shouldBlockWidgetDrag(event.target)) {
      const nextZIndex = nextWidgetZ();
      setWidgetZIndexes(prev => ({
        ...prev,
        [widgetId]: nextZIndex,
      }));
      return;
    }

    const nextZIndex = nextWidgetZ();
    setWidgetZIndexes(prev => ({
      ...prev,
      [widgetId]: nextZIndex,
    }));

    const rect = widgetRects[widgetId] || getDefaultWidgetRects()[widgetId];
    const panelRect = event.currentTarget.getBoundingClientRect();
    const nearRight = panelRect.right - event.clientX <= 18;
    const nearBottom = panelRect.bottom - event.clientY <= 18;
    const resizeEdge = nearRight && nearBottom ? 'se' : nearRight ? 'e' : nearBottom ? 's' : '';

    if (resizeEdge) {
      startWidgetResize(event, widgetId, resizeEdge, rect);
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    activeDesktopDrag.current = {
      type: 'widget-move',
      id: widgetId,
      pointerId: event.pointerId,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startX: rect.x,
      startY: rect.y,
      startW: rect.w,
      startH: rect.h,
    };
    setIsStartOpen(false);
  };

  const handleWidgetResizePointerDown = (event, widgetId) => {
    if (isMobile || event.button !== 0) {
      return;
    }

    const nextZIndex = nextWidgetZ();
    setWidgetZIndexes(prev => ({
      ...prev,
      [widgetId]: nextZIndex,
    }));

    const edge = event.currentTarget.dataset.edge;
    const rect = widgetRects[widgetId] || getDefaultWidgetRects()[widgetId];
    event.stopPropagation();
    startWidgetResize(event, widgetId, edge, rect);
  };

  const handleWidgetPointerMove = (event) => {
    const drag = activeDesktopDrag.current;
    if (!drag || !drag.type.startsWith('widget') || drag.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    const dx = event.clientX - drag.startMouseX;
    const dy = event.clientY - drag.startMouseY;

    if (drag.type === 'widget-move') {
      const point = clampDesktopPoint({
        x: drag.startX + dx,
        y: drag.startY + dy,
      }, drag.startW, drag.startH);

      setWidgetRects(prev => ({
        ...prev,
        [drag.id]: {
          ...(prev[drag.id] || {}),
          ...point,
          w: drag.startW,
          h: drag.startH,
        },
      }));
      return;
    }

    let nextRect = {
      x: drag.startX,
      y: drag.startY,
      w: drag.startW,
      h: drag.startH,
    };

    if (drag.edge.includes('e')) {
      nextRect.w = drag.startW + dx;
    }
    if (drag.edge.includes('s')) {
      nextRect.h = drag.startH + dy;
    }

    nextRect = clampWidgetRect(nextRect, drag.id);
    setWidgetRects(prev => ({
      ...prev,
      [drag.id]: nextRect,
    }));
  };

  const finishWidgetDrag = (event) => {
    const drag = activeDesktopDrag.current;
    if (!drag || !drag.type.startsWith('widget') || drag.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    activeDesktopDrag.current = null;
  };

  const focusWindow = useCallback((windowId) => {
    const z = nextZ();
    setOpenWindows(prev => prev.map(w =>
      w.id === windowId ? { ...w, zIndex: z } : w
    ));
  }, [nextZ]);

  const getIconOpenOrigin = (itemId) => {
    if (typeof document === 'undefined') {
      return null;
    }

    const icon = document.querySelector(`[data-desktop-id="${itemId}"]`);
    if (!icon) {
      return null;
    }

    const rect = icon.getBoundingClientRect();
    return {
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height,
    };
  };

  const getTaskbarOpenOrigin = useCallback((itemId) => {
    if (typeof document === 'undefined') {
      return null;
    }

    const taskbarButton = document.querySelector(`[data-taskbar-id="${itemId}"]`);
    if (!taskbarButton) {
      return null;
    }

    const rect = taskbarButton.getBoundingClientRect();
    return {
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height,
    };
  }, []);

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

    const openOrigin = getIconOpenOrigin(item.id);

    if (isMobile) {
      setMobileOpenOrigin(openOrigin);
      setMobileAppId(item.id);
      setMobileMinimized(false);
      return;
    }

    setOpenWindows(prev => {
      const existing = prev.find(w => w.id === item.id);
      if (existing) {
        const z = nextZ();
        return prev.map(w =>
          w.id === item.id ? { ...w, isMinimized: false, zIndex: z } : w
        );
      }

      return [...prev, { id: item.id, isMaximized: false, isMinimized: false, zIndex: nextZ(), openOrigin }];
    });
  };

  const closeWindow = useCallback((windowId) => {
    setOpenWindows(prev => prev.filter(w => w.id !== windowId));
  }, []);

  const minimizeWindow = useCallback((windowId) => {
    setOpenWindows(prev => prev.map(w =>
      w.id === windowId ? { ...w, isMinimized: true, openOrigin: null } : w
    ));
  }, []);

  const toggleMaximizeWindow = useCallback((windowId) => {
    setOpenWindows(prev => prev.map(w =>
      w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  }, []);

  const toggleMinimizeFromTaskbar = useCallback((windowId) => {
    const restoreOrigin = getTaskbarOpenOrigin(windowId);

    setOpenWindows(prev => {
      const win = prev.find(w => w.id === windowId);
      if (!win) return prev;
      if (win.isMinimized) {
        const z = nextZ();
        return prev.map(w =>
          w.id === windowId ? { ...w, isMinimized: false, zIndex: z, openOrigin: restoreOrigin } : w
        );
      }

      const maxZ = Math.max(...prev.map(w => w.zIndex));
      if (win.zIndex === maxZ) {
        return prev.map(w =>
          w.id === windowId ? { ...w, minimizeRequestId: (w.minimizeRequestId || 0) + 1 } : w
        );
      }

      const z = nextZ();
      return prev.map(w =>
        w.id === windowId ? { ...w, zIndex: z } : w
      );
    });
  }, [getTaskbarOpenOrigin, nextZ]);

  const toggleMobileMinimizeFromTaskbar = () => {
    if (mobileMinimized && mobileAppId) {
      setMobileOpenOrigin(getTaskbarOpenOrigin(mobileAppId));
      setMobileMinimized(false);
      return;
    }

    setMobileOpenOrigin(null);
    setMobileMinimizeRequestId(prev => prev + 1);
  };

  const resetDesktopLayout = () => {
    window.localStorage.removeItem(desktopLayoutStorageKey);
    setIconPositions(getInitialIconPositions());
    setWidgetRects(getInitialWidgetRects());
    setWidgetZIndexes({ clock: 1, stats: 2, colors: 3 });
    setIsStatsExpanded(false);
    widgetZCounterRef.current = 3;
    setMobileMinimizeRequestId(0);
    setSelectedIds([]);
    setIsStartOpen(false);
  };

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

      <DesktopStage
        consumeSuppressedIconClick={consumeSuppressedIconClick}
        desktopItems={desktopItems}
        finishIconDrag={finishIconDrag}
        finishWidgetDrag={finishWidgetDrag}
        handleIconPointerDown={handleIconPointerDown}
        handleIconPointerMove={handleIconPointerMove}
        handleWidgetPointerDown={handleWidgetPointerDown}
        handleWidgetPointerMove={handleWidgetPointerMove}
        handleWidgetResizePointerDown={handleWidgetResizePointerDown}
        iconPositions={iconPositions}
        isMobile={isMobile}
        openItem={openItem}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        widgetRects={widgetRects}
        widgets={widgets}
        widgetZIndexes={widgetZIndexes}
      />

      <WindowLayer
        closeWindow={closeWindow}
        focusWindow={focusWindow}
        internalApps={internalApps}
        isMobile={isMobile}
        mobileAppId={mobileAppId}
        mobileMaximized={mobileMaximized}
        mobileMinimized={mobileMinimized}
        mobileMinimizeRequestId={mobileMinimizeRequestId}
        mobileOpenOrigin={mobileOpenOrigin}
        minimizeWindow={minimizeWindow}
        openWindows={openWindows}
        setMobileAppId={setMobileAppId}
        setMobileMaximized={setMobileMaximized}
        setMobileMinimized={setMobileMinimized}
        setMobileMinimizeRequestId={setMobileMinimizeRequestId}
        setMobileOpenOrigin={setMobileOpenOrigin}
        setThemeColors={setThemeColors}
        theme={theme}
        themeColors={themeColors}
        toggleMaximizeWindow={toggleMaximizeWindow}
      />

      <Taskbar
        desktopItems={desktopItems}
        internalApps={internalApps}
        isMobile={isMobile}
        isStartOpen={isStartOpen}
        mobileAppId={mobileAppId}
        mobileMinimized={mobileMinimized}
        openItem={openItem}
        openWindows={openWindows}
        resetDesktopLayout={resetDesktopLayout}
        setIsStartOpen={setIsStartOpen}
        theme={theme}
        toggleMinimizeFromTaskbar={toggleMinimizeFromTaskbar}
        toggleMobileMinimizeFromTaskbar={toggleMobileMinimizeFromTaskbar}
        toggleTheme={toggleTheme}
      />
    </div>
  );
};

export default DesktopShell;
