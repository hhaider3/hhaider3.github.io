import React from 'react';
import { User, ShieldCheck, Cpu, Gauge, Layers } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="section-padding">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">About Me</h2>
          <div className="title-underline"></div>
        </div>
        <div className="about-bio-centered scroll-animate fade-in-up">
          <div className="about-bio-content">
            <h3 className="subsection-title"><User className="section-icon" size={28} /> Who I Am</h3>
            <p className="about-text">
              I am a driven software engineer with a strong foundation in building interactive, high-performance web applications and developing robust AI and machine learning integrations. With professional frontend experience at GeoAnalysis Engineering, I specialize in crafting seamless user interfaces using React, Tailwind CSS, and Node.js.
            </p>
            <p className="about-text">
              Currently, I am pursuing my M.S. in Software Engineering at Arizona State University with a specialization in Cybersecurity. My academic and project background spans various domains, including full-stack development, game engine scripting in Unity, hardware-software integration with IoT platforms, and utilizing state-of-the-art AI agents and LLMs.
            </p>
            <div className="highlights-grid">
              <div className="highlight-item">
                <ShieldCheck className="highlight-icon" size={24} />
                <span>Security Focused</span>
              </div>
              <div className="highlight-item">
                <Cpu className="highlight-icon" size={24} />
                <span>AI Integrations</span>
              </div>
              <div className="highlight-item">
                <Gauge className="highlight-icon" size={24} />
                <span>Performance Optimization</span>
              </div>
              <div className="highlight-item">
                <Layers className="highlight-icon" size={24} />
                <span>Responsive UI/UX</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
