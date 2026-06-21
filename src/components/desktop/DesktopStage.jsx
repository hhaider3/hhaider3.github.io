import DesktopIcon from './DesktopIcon';
import DesktopWidgets from './DesktopWidgets';
import { getDefaultIconPosition } from './desktopUtils';

const DesktopStage = ({
  consumeSuppressedIconClick,
  desktopItems,
  finishIconDrag,
  finishWidgetDrag,
  handleIconPointerDown,
  handleIconPointerMove,
  handleWidgetPointerDown,
  handleWidgetPointerMove,
  handleWidgetResizePointerDown,
  iconPositions,
  isMobile,
  openItem,
  selectedIds,
  setSelectedIds,
  widgetRects,
  widgets,
  widgetZIndexes,
}) => (
  <main className="desktop-stage">
    <div className={`desktop-icons ${!isMobile ? 'desktop-icons-freeform' : ''}`} aria-label="Portfolio desktop shortcuts">
      {desktopItems.map((item, index) => {
        const position = iconPositions[item.id] || getDefaultIconPosition(index);
        const iconStyle = !isMobile ? {
          left: `${position.x}px`,
          top: `${position.y}px`,
        } : undefined;

        return (
          <DesktopIcon
            key={item.id}
            item={item}
            isSelected={selectedIds.includes(item.id)}
            onSelect={(id) => setSelectedIds([id])}
            onOpen={openItem}
            onPointerDown={handleIconPointerDown}
            onPointerMove={handleIconPointerMove}
            onPointerUp={finishIconDrag}
            onPointerCancel={finishIconDrag}
            shouldSuppressClick={consumeSuppressedIconClick}
            style={iconStyle}
            isFreeform={!isMobile}
          />
        );
      })}
    </div>

    <DesktopWidgets
      finishWidgetDrag={finishWidgetDrag}
      handleWidgetPointerDown={handleWidgetPointerDown}
      handleWidgetPointerMove={handleWidgetPointerMove}
      handleWidgetResizePointerDown={handleWidgetResizePointerDown}
      isMobile={isMobile}
      widgetRects={widgetRects}
      widgets={widgets}
      widgetZIndexes={widgetZIndexes}
    />
  </main>
);

export default DesktopStage;
