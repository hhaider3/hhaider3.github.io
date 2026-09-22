const TelemetryTile = ({ label, value, detail, icon }) => (
  <div className="motion-telemetry-tile">
    <span className="motion-tile-icon">{icon}</span>
    <span className="motion-tile-label">{label}</span>
    <strong>{value}</strong>
    {detail && <small>{detail}</small>}
  </div>
);

export default TelemetryTile;
