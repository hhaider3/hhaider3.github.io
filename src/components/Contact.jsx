import { useEffect, useRef, useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, X } from 'lucide-react';

const CONTACT_EMAIL = 'hasanhaider009@gmail.com';
const CONTACT_FORM_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;
const CONTACT_FORM_FALLBACK = `https://formsubmit.co/${CONTACT_EMAIL}`;
const INITIAL_FORM_DATA = { name: '', email: '', subject: '', message: '' };

const Contact = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: ''
  });
  const toastTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showNotification = ({ type, title, message }) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ visible: true, type, title, message });
    toastTimerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on type
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message cannot be empty';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const honeypot = e.currentTarget.elements._honey?.value;
    if (honeypot) {
      setFormData(INITIAL_FORM_DATA);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(CONTACT_FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          _subject: `Portfolio contact: ${formData.subject.trim()}`,
          _template: 'table',
          _captcha: 'false',
          _honey: ''
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Unable to send message.');
      }

      setFormData(INITIAL_FORM_DATA);
      showNotification({
        type: 'success',
        title: 'Message sent',
        message: 'Thanks for reaching out. I will get back to you soon.'
      });
    } catch {
      showNotification({
        type: 'error',
        title: 'Message not sent',
        message: `Please email me directly at ${CONTACT_EMAIL}.`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section id="contact" className="section-bg section-padding">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Get In Touch</h2>
            <div className="title-underline"></div>
          </div>

          <div className="contact-grid">
            {/* Contact Info */}
            <div className="contact-info scroll-animate fade-in-left">
              <h3 className="subsection-title">Let's Connect</h3>
              <p className="contact-desc">
                Have an exciting opportunity, a project idea, or just want to chat about front-end, cybersecurity, or AI? Feel free to reach out. I'll get back to you as soon as possible!
              </p>
              <div className="contact-details-list">
                <a href={`mailto:${CONTACT_EMAIL}`} className="contact-detail-item">
                  <div className="icon-wrapper">
                    <Mail size={24} />
                  </div>
                  <div>
                    <span className="detail-label">Email Me</span>
                    <span className="detail-value">{CONTACT_EMAIL}</span>
                  </div>
                </a>
                <a href="tel:+16027252828" className="contact-detail-item">
                  <div className="icon-wrapper">
                    <Phone size={24} />
                  </div>
                  <div>
                    <span className="detail-label">Call Me</span>
                    <span className="detail-value">+1 (602) 725-2828</span>
                  </div>
                </a>
                <div className="contact-detail-item">
                  <div className="icon-wrapper">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <span className="detail-label">Location</span>
                    <span className="detail-value">Tempe, AZ / Phoenix Metro</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-container card scroll-animate fade-in-right">
              <form action={CONTACT_FORM_FALLBACK} method="POST" onSubmit={handleSubmit} noValidate>
                <input type="text" name="_honey" className="form-honeypot" tabIndex="-1" autoComplete="off" aria-hidden="true" />
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_captcha" value="false" />
                <div className="form-group-row">
                  <div className={`form-group ${errors.name ? 'error' : ''}`}>
                    <label htmlFor="contact-name">Name</label>
                    <input type="text" id="contact-name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
                    {errors.name && <span className="error-msg">{errors.name}</span>}
                  </div>
                  <div className={`form-group ${errors.email ? 'error' : ''}`}>
                    <label htmlFor="contact-email">Email</label>
                    <input type="email" id="contact-email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" />
                    {errors.email && <span className="error-msg">{errors.email}</span>}
                  </div>
                </div>
                <div className={`form-group ${errors.subject ? 'error' : ''}`}>
                  <label htmlFor="contact-subject">Subject</label>
                  <input type="text" id="contact-subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="Collaboration Idea" />
                  {errors.subject && <span className="error-msg">{errors.subject}</span>}
                </div>
                <div className={`form-group ${errors.message ? 'error' : ''}`}>
                  <label htmlFor="contact-message">Message</label>
                  <textarea id="contact-message" name="message" rows="5" value={formData.message} onChange={handleChange} placeholder="Hi Hasan, I'd love to chat about..."></textarea>
                  {errors.message && <span className="error-msg">{errors.message}</span>}
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
                  <span className="btn-text">{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                  {!isSubmitting && <Send size={18} />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      <div className={`toast ${toast.visible ? '' : 'hidden'} ${toast.type}`} role="status" aria-live="polite">
        <div className="toast-content">
          {toast.type === 'success' ? (
            <CheckCircle className="toast-icon text-success" size={20} />
          ) : (
            <AlertCircle className="toast-icon text-danger" size={20} />
          )}
          <div className="toast-message">
            <span className="toast-title">{toast.title}</span>
            <span className="toast-body">{toast.message}</span>
          </div>
          <button className="toast-close-btn" onClick={() => setToast(prev => ({ ...prev, visible: false }))}>
            <X size={20} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Contact;
