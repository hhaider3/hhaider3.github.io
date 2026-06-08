import { ArrowRight, Mail, Phone, ChevronDown } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import DualClock from './DualClock';
import ColorSwitcher from './ColorSwitcher';

const Hero = ({ theme }) => {
  return (
    <section id="hero" className="hero-section">
      <div className="container hero-container">
        <div className="hero-content fade-in-up">
          <div className="hero-badge">
            <span className="pulse-dot"></span> Available for Opportunities
          </div>
          <h1 className="hero-title">
            Building Premium <span className="text-gradient">Web Experiences</span> & <span className="text-gradient">AI Solutions</span>
          </h1>
          <p className="hero-subtitle">
            Hi, I'm <strong>Hasan Haider</strong>. I am a Software Engineer and Graduate Student at <strong>Arizona State University</strong> specializing in Frontend Performance, Intelligent AI Tools, and Cybersecurity.
          </p>
          <div className="hero-cta">
            <a href="#projects" className="btn btn-primary">Explore Work <ArrowRight size={18} /></a>
            <a href="#contact" className="btn btn-outline">Get in Touch</a>
          </div>
          <div className="hero-socials">
            <a href="https://github.com/hhaider3" target="_blank" rel="noreferrer" aria-label="GitHub" className="social-icon">
              <FaGithub size={20} />
            </a>
            <a href="https://www.linkedin.com/in/hasan-haider-52026a67/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="social-icon">
              <FaLinkedin size={20} />
            </a>
            <a href="mailto:hasanhaider009@gmail.com" aria-label="Email" className="social-icon">
              <Mail size={20} />
            </a>
            <a href="tel:+16027252828" aria-label="Phone" className="social-icon">
              <Phone size={20} />
            </a>
          </div>
        </div>
        <div className="hero-visual fade-in-up delay-1">
          <div className="hero-widgets">
            <DualClock />
            <ColorSwitcher theme={theme} />
          </div>
        </div>
      </div>
      <div className="scroll-indicator">
        <a href="#about" aria-label="Scroll Down">
          <ChevronDown size={28} />
        </a>
      </div>
    </section>
  );
};

export default Hero;
