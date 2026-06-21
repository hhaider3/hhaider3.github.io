const DesktopIcon = ({
  item,
  isSelected,
  onSelect,
  onOpen,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  shouldSuppressClick,
  style,
  isFreeform,
}) => {
  const handleClick = () => {
    if (shouldSuppressClick?.(item.id)) {
      return;
    }

    if (window.matchMedia('(pointer: coarse)').matches) {
      onOpen(item);
      return;
    }

    onSelect(item.id);
  };

  return (
    <button
      type="button"
      data-desktop-id={item.id}
      className={`desktop-icon ${isSelected ? 'selected' : ''} ${isFreeform ? 'desktop-icon-freeform' : ''}`}
      style={style}
      onPointerDown={(event) => onPointerDown?.(event, item)}
      onPointerMove={(event) => onPointerMove?.(event, item)}
      onPointerUp={(event) => onPointerUp?.(event, item)}
      onPointerCancel={(event) => onPointerCancel?.(event, item)}
      onClick={handleClick}
      onDoubleClick={() => onOpen(item)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(item);
        }
      }}
      title={`Open ${item.title}`}
      aria-label={`Open ${item.title}`}
    >
      <span className={`desktop-icon-tile ${item.accent}`}>
        {item.icon}
      </span>
      <span className="desktop-icon-label">{item.title}</span>
    </button>
  );
};

export default DesktopIcon;
