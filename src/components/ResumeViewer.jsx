import { Download, FileText } from 'lucide-react';

const resumePath = '/Hasan-Haider-Resume.pdf';

const ResumeViewer = () => {
  return (
    <section className="resume-viewer" aria-label="Resume viewer">
      <div className="resume-viewer-toolbar">
        <div className="resume-viewer-title">
          <FileText size={18} />
          <span>Hasan Haider CV</span>
        </div>
        <a
          href={resumePath}
          download="Hasan_Haider_CV.pdf"
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
          title="Hasan Haider CV PDF"
          className="resume-frame"
        />
      </div>
    </section>
  );
};

export default ResumeViewer;
