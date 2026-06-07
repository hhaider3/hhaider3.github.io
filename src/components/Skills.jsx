import React from 'react';
import { Code, Layout, Sparkles, Server, Shield } from 'lucide-react';

const Skills = () => {
  return (
    <section id="skills" className="section-bg section-padding">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">Skills & Toolkit</h2>
          <div className="title-underline"></div>
        </div>

        <div className="skills-grid">
          {/* Languages */}
          <div className="skills-category-card card scroll-animate fade-in-up">
            <div className="skills-category-header">
              <Code className="text-primary" size={24} />
              <h3>Languages</h3>
            </div>
            <div className="skills-list">
              <span className="skill-pill">Python</span>
              <span className="skill-pill font-highlight">JavaScript</span>
              <span className="skill-pill">C/C++</span>
              <span className="skill-pill">C#</span>
              <span className="skill-pill">SQL</span>
              <span className="skill-pill">HTML/CSS</span>
            </div>
          </div>

          {/* Frontend */}
          <div className="skills-category-card card scroll-animate fade-in-up delay-1">
            <div className="skills-category-header">
              <Layout className="text-info" size={24} />
              <h3>Frontend</h3>
            </div>
            <div className="skills-list">
              <span className="skill-pill font-highlight">React</span>
              <span className="skill-pill">Tailwind CSS</span>
              <span className="skill-pill">Flowbite</span>
              <span className="skill-pill">Responsive Design</span>
              <span className="skill-pill">DOM Manipulation</span>
            </div>
          </div>

          {/* AI & Tools */}
          <div className="skills-category-card card scroll-animate fade-in-up delay-2">
            <div className="skills-category-header">
              <Sparkles className="text-warning" size={24} />
              <h3>AI Tools</h3>
            </div>
            <div className="skills-list">
              <span className="skill-pill font-highlight">Google Antigravity</span>
              <span className="skill-pill">Gemini</span>
              <span className="skill-pill">OpenAI Codex</span>
              <span className="skill-pill">Cursor</span>
              <span className="skill-pill">LLM Prompting</span>
            </div>
          </div>

          {/* Backend & Tools */}
          <div className="skills-category-card card scroll-animate fade-in-up">
            <div className="skills-category-header">
              <Server className="text-success" size={24} />
              <h3>Backend & Tools</h3>
            </div>
            <div className="skills-list">
              <span className="skill-pill">Node.js</span>
              <span className="skill-pill">PyInstaller</span>
              <span className="skill-pill">Selenium</span>
              <span className="skill-pill">Git</span>
              <span className="skill-pill">Arduino</span>
              <span className="skill-pill">ESP8266</span>
              <span className="skill-pill">Unity</span>
              <span className="skill-pill">Linux</span>
            </div>
          </div>

          {/* Other Specialties */}
          <div className="skills-category-card card scroll-animate fade-in-up delay-1">
            <div className="skills-category-header">
              <Shield className="text-danger" size={24} />
              <h3>Other Specialties</h3>
            </div>
            <div className="skills-list">
              <span className="skill-pill">Neural Networks</span>
              <span className="skill-pill">CUDA</span>
              <span className="skill-pill">Thread Safety</span>
              <span className="skill-pill">OCR (Tesseract)</span>
              <span className="skill-pill">DeepL API</span>
              <span className="skill-pill">Real-Time Plotting</span>
              <span className="skill-pill">Cybersecurity Concepts</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
