import React, { useState, useEffect } from 'react';
import { Clock, Globe, MapPin } from 'lucide-react';

const DualClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Visitor's local time
  const visitorTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  const visitorZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    .split('/').pop().replace(/_/g, ' ');

  // Hasan's time — Arizona (America/Phoenix, no DST)
  const arizonaTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'America/Phoenix',
  });

  // Calculate the hour difference by comparing actual formatted hours
  const getHourInZone = (tz) => {
    const parts = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric', minute: 'numeric', hour12: false, timeZone: tz,
    }).formatToParts(now);
    const h = parseInt(parts.find(p => p.type === 'hour').value);
    const m = parseInt(parts.find(p => p.type === 'minute').value);
    return h + m / 60;
  };

  const visitorTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const visitorHour = getHourInZone(visitorTz);
  const arizonaHour = getHourInZone('America/Phoenix');
  let rawDiff = visitorHour - arizonaHour;
  // Normalize to -12..12 range for date-boundary crossings
  if (rawDiff > 12) rawDiff -= 24;
  if (rawDiff < -12) rawDiff += 24;
  const diffHours = Math.abs(rawDiff);
  const isSameZone = Math.abs(rawDiff) < 0.01;

  return (
    <div className="dual-clock-widget">
      <div className="clock-card clock-visitor">
        <div className="clock-label">
          <Globe size={14} />
          <span>Your Time</span>
        </div>
        <div className="clock-time">{visitorTime}</div>
        <div className="clock-zone">{visitorZone}</div>
      </div>

      <div className="clock-divider">
        <Clock size={16} className="clock-divider-icon" />
        {isSameZone ? (
          <span className="clock-diff same">Same zone!</span>
        ) : (
          <span className="clock-diff">
            {diffHours % 1 === 0 ? diffHours : diffHours.toFixed(1)}h {rawDiff > 0 ? 'ahead' : 'behind'}
          </span>
        )}
      </div>

      <div className="clock-card clock-hasan">
        <div className="clock-label">
          <MapPin size={14} />
          <span>My Time</span>
        </div>
        <div className="clock-time">{arizonaTime}</div>
        <div className="clock-zone">Arizona, US</div>
      </div>
    </div>
  );
};

export default DualClock;
