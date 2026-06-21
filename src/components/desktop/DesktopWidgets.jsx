import WidgetInfoButton from './WidgetInfoButton';
import {
  getDefaultWidgetRects,
  widgetLabels,
  widgetResizeEdges,
} from './desktopUtils';

const DesktopWidgets = ({
  handleWidgetPointerDown,
  handleWidgetPointerMove,
  handleWidgetResizePointerDown,
  finishWidgetDrag,
  isMobile,
  widgetRects,
  widgets,
  widgetZIndexes,
}) => (
  <aside className={`desktop-widgets ${!isMobile ? 'desktop-widgets-freeform' : ''}`} aria-label="Desktop widgets">
    {widgets.map(widget => {
      const rect = widgetRects[widget.id] || getDefaultWidgetRects()[widget.id];
      const widgetStyle = !isMobile && rect ? {
        left: `${rect.x}px`,
        top: `${rect.y}px`,
        width: `${rect.w}px`,
        height: `${rect.h}px`,
        zIndex: widgetZIndexes[widget.id] || 1,
      } : undefined;

      return (
        <section
          key={widget.id}
          className={`glass-widget desktop-widget-panel ${widget.className}`}
          style={widgetStyle}
          onPointerDown={(event) => handleWidgetPointerDown(event, widget.id)}
          onPointerMove={handleWidgetPointerMove}
          onPointerUp={finishWidgetDrag}
          onPointerCancel={finishWidgetDrag}
        >
          {!isMobile && (
            <div className="desktop-widget-grip" aria-hidden="true">
              <span>{widgetLabels[widget.id]}</span>
            </div>
          )}

          {widget.info && (
            <WidgetInfoButton title={widgetLabels[widget.id] || widget.id} info={widget.info} />
          )}

          <div className="desktop-widget-body">
            {widget.content}
          </div>

          {!isMobile && widgetResizeEdges.map(edge => (
            <span
              key={edge}
              className={`desktop-widget-resize-handle desktop-widget-resize-${edge}`}
              data-edge={edge}
              aria-hidden="true"
              onPointerDown={(event) => handleWidgetResizePointerDown(event, widget.id)}
              onPointerMove={handleWidgetPointerMove}
              onPointerUp={finishWidgetDrag}
              onPointerCancel={finishWidgetDrag}
            />
          ))}
        </section>
      );
    })}
  </aside>
);

export default DesktopWidgets;
