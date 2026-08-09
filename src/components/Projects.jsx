import { useState } from 'react';
import { Search, Bot, Gamepad2, MessageSquare, Cpu, Globe, RadioTower, Satellite, Bluetooth, Clapperboard, Crown, ExternalLink, Play } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

const projectsData = [
  {
    id: 7,
    title: 'Earth Orbit Live',
    date: 'Jul 2026 – Present',
    category: 'interactive',
    description: 'Built an interactive 3D globe that tracks live Earth-orbiting satellites from current CelesTrak data and propagates their positions in the browser with SGP4.',
    details: [
      'Rendered selectable satellite constellations, orbital paths, sunlight, atmosphere, and a readable night side with Three.js.',
      'Added pause, reverse, date selection, and logarithmic time controls for exploring orbital motion from real time to accelerated simulation.',
      'Deployed a Cloudflare Worker proxy with edge caching and clearly labeled simulated fallbacks when live TLE sources are unavailable.',
    ],
    tags: ['TypeScript', 'React', 'Three.js', 'satellite.js', 'SGP4', 'Cloudflare Workers'],
    gradientClass: 'bg-gradient-orbit',
    icon: <Satellite className="project-banner-icon" />,
    links: [
      { url: 'https://github.com/hhaider3/live-sat-location', label: 'Code', icon: <FaGithub size={16} /> },
      { url: 'https://live-sat-location.hasanhaider009.workers.dev/', label: 'Live Demo', icon: <ExternalLink size={16} /> }
    ]
  },
  {
    id: 8,
    title: 'NearbyBluetooth',
    date: 'Aug 2026',
    category: 'native',
    description: 'Created a cross-platform React Native app that discovers nearby Bluetooth Low Energy advertisers and visualizes live signal strength on physical Android and iOS devices.',
    details: [
      'Implemented platform-specific Bluetooth permissions and timed BLE discovery with react-native-ble-plx.',
      'Kept scan results stable in first-seen order while supporting repeat scans and device selection.',
      'Built active device tracking with a live RSSI meter and numeric dBm readings, plus Android paired-audio-device discovery.',
    ],
    tags: ['TypeScript', 'React Native', 'Bluetooth LE', 'react-native-ble-plx', 'Android', 'iOS'],
    gradientClass: 'bg-gradient-ble',
    icon: <Bluetooth className="project-banner-icon" />,
    links: [
      { url: 'https://github.com/hhaider3/ble-scanner', label: 'Code', icon: <FaGithub size={16} /> }
    ]
  },
  {
    id: 10,
    title: 'Stockfish Online',
    date: 'Jul 2026 – Present',
    category: 'game',
    description: 'Built a browser-based chess app for playing against Stockfish 18 with private on-device analysis, live evaluation, and configurable engine strength.',
    details: [
      'Implemented click and drag-and-drop play as either color with five difficulty levels, undo, new-game, and analysis controls.',
      'Ran Stockfish entirely in the browser through WebAssembly and a Web Worker, communicating with the engine through the UCI protocol.',
      'Displayed a live evaluation bar, best move, and principal variation while keeping positions and analysis on the user\'s device.',
    ],
    tags: ['TypeScript', 'React', 'Stockfish 18', 'WebAssembly', 'Web Workers', 'chess.js'],
    gradientClass: 'bg-gradient-chess',
    icon: <Crown className="project-banner-icon" />,
    links: [
      { url: 'https://github.com/hhaider3/stockfishonline', label: 'Code', icon: <FaGithub size={16} /> },
      { url: 'https://site-creator-vinext-starter.hasanhaider009.workers.dev/', label: 'Play Online', icon: <Play size={16} /> }
    ]
  },
  {
    id: 9,
    title: 'macmpv',
    date: 'Aug 2026',
    category: 'native',
    description: 'Developed a native macOS media player in SwiftUI with embedded, hardware-accelerated mpv playback and ffprobe-powered media metadata.',
    details: [
      'Added local file and network-stream playback with queues, seeking, speed controls, track selection, subtitles, screenshots, and full-screen support.',
      'Persisted per-file playback progress and intro/outro markers while providing drag-and-drop queue management and native keyboard commands.',
      'Wrapped libmpv for rendering and used FFmpeg to inspect duration, resolution, frame rate, codecs, and container formats.',
    ],
    tags: ['Swift', 'SwiftUI', 'macOS', 'libmpv', 'FFmpeg', 'Swift Package Manager'],
    gradientClass: 'bg-gradient-media',
    icon: <Clapperboard className="project-banner-icon" />,
    links: [
      { url: 'https://github.com/hhaider3/macmpv', label: 'Code', icon: <FaGithub size={16} /> }
    ]
  },
  {
    id: 1,
    title: 'Ollama-Based Multimedia Edubot',
    date: 'Jan 2026 – Apr 2026',
    category: 'ai',
    description: 'Led a team of 6 people to add multimedia capabilities to an educational chatbot by retrieving relevant Wikimedia images instead of generating AI images, reducing operational costs.',
    details: [
      'Built a database in ChromaDB to cache images for faster retrieval.',
      'Added the ability to run the whole system offline using Ollama and added a switch for Online/Offline mode.',
      'Coordinated planning using Taiga board, weekly scrum meetings and other agile methodologies.',
    ],
    tags: ['Python', 'Wikimedia API', 'ChromaDB', 'Ollama', 'SQL', 'LLMs', 'Taiga'],
    gradientClass: 'bg-gradient-ai',
    icon: <Bot className="project-banner-icon" />,
    links: [
      { url: 'https://github.com/hhaider3', label: 'Code', icon: <FaGithub size={16} /> },
      { url: '#', label: 'Live Demo', icon: <ExternalLink size={16} />, disabled: true }
    ]
  },
  {
    id: 2,
    title: 'Unity-Based FPS Shooter',
    date: 'Sep 2025 – Dec 2025',
    category: 'game',
    description: 'A 3D 6DoF First-Person Shooter game developed in Unity featuring procedural world generation, dynamically generating unique levels and layout geometries for every playthrough.',
    details: [
      'Built a 3D procedural layout system where the world and level change dynamically every time it is played.',
      'Programmed an enemy AI system with variable difficulty that tracks and shoots at the player in 3D space while avoiding moving obstacles.',
    ],
    tags: ['C#', 'Unity', '3D Math', 'Procedural Gen', 'AI Navigation'],
    gradientClass: 'bg-gradient-game',
    icon: <Gamepad2 className="project-banner-icon" />,
    links: [
      { url: 'https://github.com/hhaider3', label: 'Code', icon: <FaGithub size={16} /> },
      { url: '#', label: 'Play WebGL', icon: <Play size={16} />, disabled: true }
    ]
  },
  {
    id: 3,
    title: 'Time Globe',
    date: 'Jun 2026',
    category: 'interactive',
    description: 'Built an interactive Three.js globe that visualizes time zones, live sunlight, and current date boundaries across the Earth.',
    details: [
      'Rendered timezone boundary data on a 3D Earth with selectable zones, highlighted borders, and local time/date readouts.',
      'Implemented real-time solar positioning, day/night shading, atmosphere effects, and automatic date-line updates.',
      'Added pointer controls for drag, zoom, and click-to-inspect behavior with stable resizing across desktop windows.',
    ],
    tags: ['React', 'Three.js', 'JavaScript', 'WebGL', 'Intl API', 'Geospatial Data'],
    gradientClass: 'bg-gradient-globe',
    icon: <Globe className="project-banner-icon" />,
    links: [
      { url: 'https://github.com/hhaider3', label: 'Code', icon: <FaGithub size={16} /> },
      { url: '#', label: 'Live Demo', icon: <ExternalLink size={16} />, appId: 'globe' }
    ]
  },
  {
    id: 4,
    title: 'Motion Labs',
    date: 'Jun 2026',
    category: 'interactive',
    description: 'Created a browser-based motion lab that pairs a phone with a desktop viewport and turns live sensor data into a 3D sword interaction.',
    details: [
      'Built QR-based phone pairing with HTTPS-aware routing, session IDs, and a hosted/local relay fallback for live sensor packets.',
      'Streamed DeviceMotion and DeviceOrientation data through WebSocket/SSE endpoints with packet-rate telemetry and reconnect handling.',
      'Mapped calibrated phone orientation and acceleration into a Three.js sword scene with hit detection, scoring, and live sensor readouts.',
    ],
    tags: ['React', 'Three.js', 'Node.js', 'WebSocket', 'SSE', 'DeviceMotion API'],
    gradientClass: 'bg-gradient-motion',
    icon: <RadioTower className="project-banner-icon" />,
    links: [
      { url: 'https://github.com/hhaider3', label: 'Code', icon: <FaGithub size={16} /> },
      { url: '#', label: 'Live Demo', icon: <ExternalLink size={16} />, appId: 'motion' }
    ]
  },
  {
    id: 5,
    title: 'Discord.js Web Bot',
    date: 'Dec 2019 – Jan 2021',
    category: 'web',
    description: 'Built an automated Discord bot that scrapes external websites using Selenium and displays requested data in servers through user commands.',
    details: [
      'Implemented headless web scraping services to safely query web items.',
      'Configured multiple server commands with rate limiting and automated error handling pipelines.',
    ],
    tags: ['JavaScript', 'discord.js', 'Selenium', 'Node.js'],
    gradientClass: 'bg-gradient-web',
    icon: <MessageSquare className="project-banner-icon" />,
    links: [
      { url: 'https://github.com/hhaider3', label: 'Code', icon: <FaGithub size={16} /> }
    ]
  },
  {
    id: 6,
    title: 'IoT-Based Weighing Scale',
    date: 'Jan 2020 – Mar 2020',
    category: 'iot',
    description: 'Modified a standard physical weighing scale to wirelessly send live measurements to Adafruit IO for secure, remote dashboard viewing.',
    details: [
      'Interfaced ESP8266 microcontrollers with physical load cell modules using Arduino IDE.',
      'Established reliable MQTT connections to transmit data streams in real-time under power-saving modes.',
    ],
    tags: ['Python', 'Arduino', 'ESP8266', 'MQTT', 'Adafruit IO'],
    gradientClass: 'bg-gradient-iot',
    icon: <Cpu className="project-banner-icon" />,
    links: [
      { url: 'https://github.com/hhaider3', label: 'Code', icon: <FaGithub size={16} /> }
    ]
  }
];

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const openDesktopApp = (event, appId) => {
    if (!appId) {
      return;
    }

    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();

    window.dispatchEvent(new CustomEvent('portfolio:open-app', {
      detail: {
        appId,
        openOrigin: {
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
        },
      },
    }));
  };

  const filteredProjects = projectsData.filter(project => {
    const matchesCategory = activeFilter === 'all' || project.category === activeFilter;
    const lowerQuery = searchQuery.toLowerCase();
    const matchesSearch = lowerQuery === '' || 
      project.title.toLowerCase().includes(lowerQuery) || 
      project.description.toLowerCase().includes(lowerQuery) || 
      project.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
      project.details.some(d => d.toLowerCase().includes(lowerQuery));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="projects" className="section-padding">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">Featured Projects</h2>
          <div className="title-underline"></div>
        </div>

        {/* Filters & Search */}
        <div className="projects-controls scroll-animate fade-in-up">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="project-search"
              placeholder="Search by name, tech or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All</button>
            <button className={`filter-btn ${activeFilter === 'ai' ? 'active' : ''}`} onClick={() => setActiveFilter('ai')}>AI & LLMs</button>
            <button className={`filter-btn ${activeFilter === 'interactive' ? 'active' : ''}`} onClick={() => setActiveFilter('interactive')}>Interactive 3D</button>
            <button className={`filter-btn ${activeFilter === 'native' ? 'active' : ''}`} onClick={() => setActiveFilter('native')}>Native Apps</button>
            <button className={`filter-btn ${activeFilter === 'web' ? 'active' : ''}`} onClick={() => setActiveFilter('web')}>Web Development</button>
            <button className={`filter-btn ${activeFilter === 'game' ? 'active' : ''}`} onClick={() => setActiveFilter('game')}>Game Dev</button>
            <button className={`filter-btn ${activeFilter === 'iot' ? 'active' : ''}`} onClick={() => setActiveFilter('iot')}>IoT & Hardware</button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="projects-grid scroll-animate fade-in-up">
          {filteredProjects.map((project) => (
            <div key={project.id} className="project-card card" style={{ animation: 'fade-in-up 0.4s ease-out forwards' }}>
              <div className={`project-banner ${project.gradientClass}`}>
                {project.icon}
              </div>
              <div className="project-content">
                <div className="project-header">
                  <span className="project-date">{project.date}</span>
                  <h3 className="project-title">{project.title}</h3>
                </div>
                <p className="project-description">{project.description}</p>
                <ul className="project-details">
                  {project.details.map((detail, idx) => <li key={idx}>{detail}</li>)}
                </ul>
                <div className="project-tags">
                  {project.tags.map((tag, idx) => <span key={idx}>{tag}</span>)}
                </div>
                <div className="project-links">
                  {project.links.map((link, idx) => (
                    <a 
                      key={idx} 
                      href={link.url} 
                      target={link.disabled || link.appId ? undefined : "_blank"}
                      rel="noreferrer" 
                      className={`project-link-btn ${link.disabled ? 'disabled' : ''}`}
                      onClick={(e) => {
                        if (link.appId) {
                          openDesktopApp(e, link.appId);
                          return;
                        }

                        if (link.disabled) {
                          e.preventDefault();
                        }
                      }}
                    >
                      {link.icon} {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {filteredProjects.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No projects found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Projects;
