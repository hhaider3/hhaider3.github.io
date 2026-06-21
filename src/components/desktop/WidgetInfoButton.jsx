import { useState } from 'react';
import ReactDOM from 'react-dom';
import { Info, X } from 'lucide-react';

const WidgetInfoButton = ({ title, info }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`widget-info-btn ${open ? 'active' : ''}`}
        aria-label="Widget info"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
      >
        <Info size={12} />
      </button>
      {open && ReactDOM.createPortal(
        <div className="widget-info-overlay" onPointerDown={() => setOpen(false)}>
          <section
            className="portfolio-window widget-info-dialog"
            onPointerDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={`${title} info`}
          >
            <div className="window-frame-glow" aria-hidden="true"></div>
            <div className="window-titlebar">
              <div className="window-title">
                <span className="window-favicon accent-blue"><Info size={16} /></span>
                <span>{title} &mdash; Info</span>
              </div>
              <div className="window-title-actions">
                <div className="window-controls">
                  <button type="button" className="window-close" aria-label="Close" onClick={() => setOpen(false)}>
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div className="widget-info-body">
              <p>{info}</p>
            </div>
          </section>
        </div>,
        document.body
      )}
    </>
  );
};

export default WidgetInfoButton;
