import { Mail } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer>
      <div className="container footer-container">
        <div className="footer-info">
          <a href="#hero" className="logo">&lt;Hasan.H /&gt;</a>
          <p>Crafting high-quality software experiences.</p>
        </div>
        <div className="footer-links">
          <a href="#about">About</a>
          <a href="#experience">Experience</a>
          <a href="#projects">Projects</a>
          <a href="#skills">Skills</a>
          <a href="#publications">Publications</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Hasan Haider. All rights reserved.</p>
          <div className="social-links-footer">
            <a href="https://github.com/hhaider3" target="_blank" rel="noreferrer" aria-label="GitHub"><FaGithub size={18} /></a>
            <a href="https://www.linkedin.com/in/hasan-haider-52026a67/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedin size={18} /></a>
            <a href="mailto:hasanhaider009@gmail.com" aria-label="Email"><Mail size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
