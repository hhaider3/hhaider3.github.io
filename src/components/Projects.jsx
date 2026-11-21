import { useState } from 'react';
import { Search, Bot, Car, Terminal, Gamepad2, MessageSquare, Cpu, Globe, RadioTower, Satellite, Bluetooth, Clapperboard, Crown, ExternalLink, Play, Rocket, Smartphone, Download } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

const projectsData = [
  {
    id: 13,
    title: 'Kerbal-ish Space Program',
    date: 'Nov 2026',
    category: 'game',
    description: 'Built a browser spaceflight sandbox inspired by Kerbal Space Program: assemble staged rockets from a 40-part workshop, fly them through the atmosphere, plan maneuvers, reach orbit, and land on the Mun.',
    details: [
      'Simulated inverse-square gravity from two bodies, atmospheric drag and rotation, pressure-dependent engine thrust, and stage-specific fuel flow with velocity Verlet integration in SI units.',
      'Designed a drag-and-drop vehicle workshop with catalog search, smart attachment, stage assemblies, undo/redo, exploded views, and automatic design saves.',
      'Added an ascent autopilot that flies the gravity turn, drops spent stages, and circularizes, plus maneuver nodes, time warp, SAS modes, and validated quicksaves covered by deterministic regression tests.',
    ],
    tags: ['JavaScript', 'Three.js', 'Orbital Mechanics', 'Physics Simulation', 'Node.js', 'Cloudflare Pages'],
    gradientClass: 'bg-gradient-space',
    icon: <Rocket className="project-banner-icon" />,
    links: [
      { url: 'https://github.com/hhaider3/ksp', label: 'Code', icon: <FaGithub size={16} /> },
      { url: 'https://kerbal-ish.pages.dev/', label: 'Play Online', icon: <Play size={16} /> }
    ]
  },
  {
    id: 11,
    title: 'Endless Drive (Project Magellan)',
    date: 'Sep 2026 – Present',
    category: 'game',
    description: 'Built an endless, procedurally generated world to drive, sail, and fly through, with two vehicles: an off-road 4×4 that turns into a boat and a plane, and a supercar with cold-gas thrusters.',
    details: [
      'Generated meadows, forests, deserts, snowfields, lakes, rivers, and inland seas in a module worker, with a road network that follows the terrain and instanced scenery for a large Three.js world.',
      'Implemented fixed-step vehicle physics for driving, boating, and flight, with jump and barrel-roll ramps, collisions, and thunder, sand, and snow storms.',
      'Added a Synth mode, an original soundtrack, a garage view, shareable seeds, and touch controls; an Android companion app runs the game above 60 fps.',
    ],
    tags: ['JavaScript', 'Three.js', 'WebGL', 'Web Workers', 'Procedural Generation', 'Cloudflare Pages'],
    gradientClass: 'bg-gradient-globe',
    icon: <Car className="project-banner-icon" />,
    links: [
      { url: 'https://github.com/hhaider3/project-magellan', label: 'Code', icon: <FaGithub size={16} /> },
      { url: 'https://project-magellan.pages.dev/', label: 'Play Online', icon: <Play size={16} /> }
    ]
  },
  {
    id: 14,
    title: 'andrompv',
    date: 'Oct 2026',
    category: 'native',
    description: 'Rebuilt macmpv natively for Android with a Jetpack Compose glass interface over real mpv and FFmpeg playback.',
    details: [
      'Bridged libmpv and FFmpeg through JNI and streamed torrents with native libtorrent.',
      'Added double-tap seeking, swipe gestures for volume and brightness, picture-in-picture, and background audio.',
      'Shipped in-app updates delivered from GitHub releases.',
    ],
    tags: ['Kotlin', 'Jetpack Compose', 'libmpv', 'FFmpeg', 'libtorrent', 'JNI'],
    gradientClass: 'bg-gradient-media',
    icon: <Smartphone className="project-banner-icon" />,
    links: [
      { url: 'https://github.com/hhaider3/andrompv', label: 'Code', icon: <FaGithub size={16} /> },
      { url: 'https://github.com/hhaider3/andrompv/releases/latest', label: 'Download', icon: <Download size={16} /> }
    ]
  },
  {
    id: 15,
    title: 'Endless Drive for Android',
    date: 'Oct 2026',
    category: 'native',
    description: 'Packaged Endless Drive as a full-screen Android app that requests the display\'s fastest refresh mode, so the game runs above the 60 Hz cap many phone browsers impose.',
    details: [
      'Hosted the game in a WebView served from local assets, including byte-range responses for smooth music playback.',
      'Downloaded new game versions automatically over Wi-Fi so the app stays current without store updates.',
    ],
    tags: ['Java', 'Android', 'WebView', 'High Refresh Rate'],
    gradientClass: 'bg-gradient-android',
    icon: <Car className="project-banner-icon" />,
    links: [
      { url: 'https://github.com/hhaider3/endless-drive-android', label: 'Code', icon: <FaGithub size={16} /> },
      { url: 'https://github.com/hhaider3/endless-drive-android/releases/latest', label: 'Download APK', icon: <Download size={16} /> }
    ]
  },
  {
    id: 12,
    title: 'TERMINAL // BREACH',
    date: 'Sep 2026',
    category: 'game',
    description: 'Developed an arena FPS that runs in a terminal: five waves, then an endless mode, with its game simulation, renderer, input handling, and terminal lifecycle implemented in Rust.',
    details: [
      'Rendered an industrial arena, procedural enemies, shotgun, lighting, and HUD using truecolor or 256-color terminal output.',
      'Built enemy variants, shotgun combat, dodging, pickups, and score multipliers with a fixed 120 Hz simulation.',
      'Used Crossterm for keyboard, mouse, focus, and resize events, with pixel-precise mouse aim where the terminal supports it and incremental cell updates.',
      'Saved a local player profile with best scores across runs.',
    ],
    tags: ['Rust', 'Crossterm', 'ANSI', 'Terminal Rendering', 'Game Physics', 'Cargo'],
    gradientClass: 'bg-gradient-game',
    icon: <Terminal className="project-banner-icon" />,
    links: [
      { url: 'https://github.com/hhaider3/terminalshooter', label: 'Code', icon: <FaGithub size={16} /> },
      { url: 'https://github.com/hhaider3/terminalshooter#play', label: 'How to Play', icon: <Terminal size={16} /> }
    ]
  },
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
    title: 'Stockfish Board',
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
    date: 'Aug 2026 – Present',
    category: 'native',
    description: 'Developed a native macOS media player in SwiftUI with embedded, hardware-accelerated mpv playback, torrent streaming, and signed automatic updates.',
    details: [
      'Added local file, network-stream, and torrent playback with a persistent queue, instant seek previews, styleable subtitles, track selection, and full-screen support.',
      'Showed per-video download progress, played saved torrents straight from disk, and stopped seeding once the queue finished.',
      'Wrapped libmpv for rendering and used FFmpeg to inspect duration, resolution, frame rate, codecs, and container formats.',
    ],
    tags: ['Swift', 'SwiftUI', 'macOS', 'libmpv', 'FFmpeg', 'WebTorrent'],
    gradientClass: 'bg-gradient-media',
    icon: <Clapperboard className="project-banner-icon" />,
    links: [
      { url: 'https://github.com/hhaider3/macmpv', label: 'Code', icon: <FaGithub size={16} /> },
      { url: 'https://macmpv.pages.dev/', label: 'Website', icon: <ExternalLink size={16} /> }
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
      { url: 'https://github.com/hhaider3/hhaider3.github.io/tree/source', label: 'Code', icon: <FaGithub size={16} /> },
      { url: '#', label: 'Live Demo', icon: <ExternalLink size={16} />, appId: 'globe' }
    ]
  },
  {
    id: 4,
    title: 'Motion Lab',
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
      { url: 'https://github.com/hhaider3/motionlab', label: 'Code', icon: <FaGithub size={16} /> },
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
                  {project.date && <span className="project-date">{project.date}</span>}
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
