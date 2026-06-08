import React from 'react';
import { Calendar, MapPin, Briefcase, GraduationCap } from 'lucide-react';

const timelineData = [
  {
    id: 'gae-internship',
    type: 'work',
    title: 'Software Engineering Intern',
    org: 'GAE Internship',
    date: 'May 2025 – Aug 2025',
    start: { year: 2025, month: 5 },
    end: { year: 2025, month: 8 },
    location: 'Phoenix, AZ',
    tags: ['Python', 'PyInstaller', 'Git', 'Debugging'],
    bullets: [
      <React.Fragment key="1">Refactored the Intelligent Thermal Conductivity Meter from the ground up, improving modularity and reducing loading time by <strong>38%</strong>.</React.Fragment>,
      <React.Fragment key="2">Reduced active threads by <strong>25%</strong> through cleaner threading logic and optimized runtime behavior.</React.Fragment>,
      'Built a lightweight, thread-safe live data plotter for real-time instrument readings.',
      'Created automated error handling and a PyInstaller pipeline for generating easy-to-use Windows installers.',
    ],
  },
  {
    id: 'asu-ms',
    type: 'education',
    title: 'M.S. Software Engineering',
    org: 'Arizona State University',
    date: 'Aug 2024 – May 2026',
    start: { year: 2024, month: 8 },
    end: { year: 2026, month: 5 },
    location: 'Tempe, AZ',
    detail: 'Specialization in Cybersecurity',
  },
  {
    id: 'gae-frontend',
    type: 'work',
    title: 'FrontEnd React Developer',
    org: 'GeoAnalysis Engineering',
    date: 'Jul 2023 – Jun 2024',
    start: { year: 2023, month: 7 },
    end: { year: 2024, month: 6 },
    location: 'Tempe, AZ (Remote)',
    tags: ['React', 'Tailwind CSS', 'JavaScript', 'Flowbite', 'Node.js'],
    bullets: [
      'Developed a fully responsive website from client requirements using modern frontend technologies.',
      'Gathered requirements, refactored the legacy codebase, and built a parallel site that replaced the original.',
      <React.Fragment key="3">Improved performance and loading time by <strong>55%</strong> while optimizing layouts for multiple screen sizes.</React.Fragment>,
    ],
  },
  {
    id: 'kiet-btech',
    type: 'education',
    title: 'B.Tech Information Technology',
    org: 'KIET Group of Institutions',
    date: 'Aug 2019 – Jul 2023',
    start: { year: 2019, month: 8 },
    end: { year: 2023, month: 7 },
    location: 'Delhi NCR, India',
    detail: 'GPA: 7.32/10',
  },
];

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const timelineStart = { year: 2019, month: 8 };
const timelineEndExclusive = { year: 2026, month: 6 };
const timelineHeight = 960;
const timelineBottomReserve = 340;

const toMonthNumber = ({ year, month }) => year * 12 + month - 1;
const timelineStartMonth = toMonthNumber(timelineStart);
const timelineEndMonth = toMonthNumber(timelineEndExclusive);
const timelineMonthSpan = timelineEndMonth - timelineStartMonth;

const monthToDate = (monthNumber) => ({
  year: Math.floor(monthNumber / 12),
  month: (monthNumber % 12) + 1,
});

const getStartOffset = (date) => ((toMonthNumber(date) - timelineStartMonth) / timelineMonthSpan) * timelineHeight;
const getEndOffset = (date) => ((toMonthNumber(date) + 1 - timelineStartMonth) / timelineMonthSpan) * timelineHeight;
const formatMonthYear = ({ year, month }) => `${monthNames[month - 1]} ${year}`;
const getEstimatedCardHeight = (item) => (item.type === 'work' ? 340 : 260);

const importantMonths = new Set(
  timelineData.flatMap(item => [toMonthNumber(item.start), toMonthNumber(item.end)])
);

const axisTicks = Array.from({ length: timelineMonthSpan }, (_, index) => {
  const monthNumber = timelineStartMonth + index;
  const date = monthToDate(monthNumber);
  const isYear = date.month === 1;
  const isEndpoint = index === 0 || index === timelineMonthSpan - 1;
  const isImportant = importantMonths.has(monthNumber);
  const label = isEndpoint || isImportant
    ? formatMonthYear(date)
    : isYear
      ? String(date.year)
      : '';

  return {
    id: `${date.year}-${date.month}`,
    top: (index / timelineMonthSpan) * timelineHeight,
    label,
    isYear,
    isImportant,
  };
});

const timelineItemsByDate = timelineData
  .map(item => {
    const startOffset = getStartOffset(item.start);
    const endOffset = getEndOffset(item.end);

    return {
      ...item,
      lane: item.type === 'work' ? 'left' : 'right',
      startOffset,
      durationOffset: Math.max(28, endOffset - startOffset),
    };
  })
  .sort((a, b) => toMonthNumber(a.start) - toMonthNumber(b.start));

const timelineItems = timelineItemsByDate.reduce((items, item) => {
  const laneBottoms = items.laneBottoms || { work: 0, education: 0 };
  const cardOffset = Math.max(item.startOffset, laneBottoms[item.type]);
  const nextLaneBottom = cardOffset + getEstimatedCardHeight(item) + 32;

  items.laneBottoms = {
    ...laneBottoms,
    [item.type]: nextLaneBottom,
  };
  items.result.push({
    ...item,
    cardOffset,
  });

  return items;
}, { result: [], laneBottoms: { work: 0, education: 0 } }).result;

const Experience = () => {
  return (
    <section id="experience" className="section-bg section-padding">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">Experience & Education</h2>
          <div className="title-underline"></div>
        </div>
        
        <div
          className="proportional-timeline scroll-animate fade-in-up"
          style={{
            '--timeline-height': `${timelineHeight}px`,
            '--timeline-total-height': `${timelineHeight + timelineBottomReserve}px`
          }}
        >
          <div className="timeline-lane-labels" aria-hidden="true">
            <span>Work</span>
            <span>Dates</span>
            <span>Education</span>
          </div>

          <div className="timeline-scale">
            <div className="timeline-axis-panel" aria-hidden="true">
              <div className="timeline-axis-line"></div>
              {axisTicks.map(tick => (
                <div
                  key={tick.id}
                  className={`timeline-tick ${tick.isYear ? 'is-year' : ''} ${tick.isImportant ? 'is-important' : ''} ${tick.label ? 'has-label' : ''}`}
                  style={{ '--tick-top': `${tick.top}px` }}
                >
                  <span className="timeline-tick-mark"></span>
                  {tick.label && <span className="timeline-tick-label">{tick.label}</span>}
                </div>
              ))}
            </div>

            {timelineItems.map(item => {
              const isWork = item.type === 'work';
              return (
                <div
                  key={`${item.id}-period`}
                  className={`timeline-period timeline-period-${item.type} timeline-period-${item.lane}`}
                  style={{
                    '--period-top': `${item.startOffset}px`,
                    '--period-height': `${item.durationOffset}px`
                  }}
                  aria-hidden="true"
                >
                  <span className="timeline-period-dot">
                    {isWork ? <Briefcase size={16} /> : <GraduationCap size={16} />}
                  </span>
                </div>
              );
            })}

            <div className="timeline-items-container">
              {timelineItems.map((item) => {
              const isWork = item.type === 'work';
              
              return (
                <article 
                  key={item.id} 
                  className={`dated-timeline-item timeline-${item.type} timeline-${item.lane}`}
                  style={{ '--item-top': `${item.cardOffset}px` }}
                >
                  <div className="timeline-mobile-marker" aria-hidden="true">
                    <div className={`timeline-mobile-dot timeline-mobile-dot-${item.type}`}>
                      {isWork ? <Briefcase size={18} /> : <GraduationCap size={18} />}
                    </div>
                  </div>

                  <div className="experience-card card">
                    <div className="exp-header">
                      <div className="exp-title-group">
                        <span className={`exp-type-badge ${item.type}`}>
                          {isWork ? 'Work' : 'Education'}
                        </span>
                        <h3 className="exp-role">{item.title}</h3>
                        <h4 className="exp-company">{item.org}</h4>
                      </div>
                      <div className="exp-meta">
                        <span className="exp-date">
                          <Calendar size={16} /> {item.date}
                        </span>
                        <span className="exp-location"><MapPin size={16} /> {item.location}</span>
                      </div>
                    </div>

                    <div className="exp-details-wrapper">
                      <div className="exp-details-inner">
                        {item.detail && (
                          <p className="edu-spec">{item.detail}</p>
                        )}

                        {item.tags && (
                          <div className="exp-tags">
                            {item.tags.map((tag, j) => (
                              <span className="tag" key={j}>{tag}</span>
                            ))}
                          </div>
                        )}

                        {item.bullets && (
                          <ul className="exp-bullets">
                            {item.bullets.map((bullet, j) => (
                              <li key={j}>{bullet}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
