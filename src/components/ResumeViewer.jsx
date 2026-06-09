import { Download, FileText } from 'lucide-react';

const resumePath = '/Hasan-Haider-Resume.pdf';

const ResumeViewer = () => {
  return (
    <section className="resume-viewer" aria-label="Resume viewer">
      <div className="resume-viewer-toolbar">
        <div className="resume-viewer-title">
          <FileText size={18} />
          <span>Hasan Haider Resume</span>
        </div>
        <a
          href={resumePath}
          download
          className="resume-download-button"
          aria-label="Download CV"
        >
          <Download size={16} />
          <span>Download CV</span>
        </a>
      </div>

      <div className="resume-frame-shell">
        <iframe
          src={`${resumePath}#toolbar=0&navpanes=0`}
          title="Hasan Haider Resume PDF"
          className="resume-frame"
        />
      </div>
    </section>
  );
};

export default ResumeViewer;
