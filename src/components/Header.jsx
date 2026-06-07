import React, { useState, useEffect } from 'react';
import { Sun, Moon, Download, Menu, X } from 'lucide-react';

const Header = ({ theme, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      const sections = ['about', 'experience', 'projects', 'skills', 'publications', 'contact'];
      let current = '';
      sections.forEach(sec => {
        const el = document.getElementById(sec);
        if (el && window.scrollY >= (el.offsetTop - 120)) {
          current = sec;
        }
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'publications', label: 'Publications' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className="main-header" style={{ boxShadow: isScrolled ? 'var(--shadow-md)' : 'var(--glass-shadow)' }}>
      <div className="container header-container">
        <a href="#hero" className="logo">
          <span className="logo-accent">&lt;</span>Hasan<span className="logo-accent">.H /&gt;</span>
        </a>
        <nav className="navbar">
          {navLinks.map(link => (
            <a 
              key={link.id} 
              href={`#${link.id}`} 
              className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a href="/Hasan_s_cv (14).pdf" className="btn btn-secondary btn-sm download-cv-btn" target="_blank" rel="noreferrer">
            <Download size={16} /> CV
          </a>
          <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Nav */}
      <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        {navLinks.map(link => (
          <a 
            key={link.id} 
            href={`#${link.id}`} 
            className="mobile-nav-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {link.label}
          </a>
        ))}
        <div className="mobile-actions">
          <a href="/Hasan_s_cv (14).pdf" className="btn btn-secondary" target="_blank" rel="noreferrer">
            <Download size={16} /> Download CV
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
