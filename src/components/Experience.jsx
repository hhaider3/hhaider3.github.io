import React from 'react';
import { Calendar, MapPin, Briefcase, GraduationCap } from 'lucide-react';

const timelineData = [
  {
    type: 'work',
    title: 'Software Engineering Intern',
    org: 'GAE Internship',
    date: 'May 2025 – Aug 2025',
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
    type: 'education',
    title: 'M.S. Software Engineering',
    org: 'Arizona State University',
    date: 'Aug 2024 – May 2026',
    location: 'Tempe, AZ',
    detail: 'Specialization in Cybersecurity',
  },
  {
    type: 'work',
    title: 'FrontEnd React Developer',
    org: 'GeoAnalysis Engineering',
    date: 'Jul 2023 – Jun 2024',
    location: 'Tempe, AZ (Remote)',
    tags: ['React', 'Tailwind CSS', 'JavaScript', 'Flowbite', 'Node.js'],
    bullets: [
      'Developed a fully responsive website from client requirements using modern frontend technologies.',
      'Gathered requirements, refactored the legacy codebase, and built a parallel site that replaced the original.',
      <React.Fragment key="3">Improved performance and loading time by <strong>55%</strong> while optimizing layouts for multiple screen sizes.</React.Fragment>,
    ],
  },
  {
    type: 'education',
    title: 'B.Tech Information Technology',
    org: 'KIET Group of Institutions',
    date: 'Aug 2019 – Jul 2023',
    location: 'Delhi NCR, India',
    detail: 'GPA: 7.32/10',
  },
];

const Experience = () => {
  return (
    <section id="experience" className="section-bg section-padding">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">Experience & Education</h2>
          <div className="title-underline"></div>
        </div>
        
        <div className="proportional-timeline scroll-animate fade-in-up">
          <div className="timeline-axis" aria-hidden="true"></div>

          <div className="timeline-items-container">
            {timelineData.map((item, i) => {
              const isWork = item.type === 'work';
              
              return (
                <article 
                  key={i} 
                  className={`timeline-item timeline-${item.type} ${isWork ? 'timeline-left' : 'timeline-right'}`}
                >
                  <div className="timeline-marker" aria-hidden="true">
                    <div className={`timeline-dot timeline-dot-${item.type}`}>
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
                        <span className="exp-date"><Calendar size={16} /> {item.date}</span>
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
    </section>
  );
};

export default Experience;
