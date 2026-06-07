import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, X } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      // Simulate network
      setTimeout(() => {
        setIsSubmitting(false);
        setShowToast(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setShowToast(false), 4000);
      }, 1500);
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
                <a href="mailto:hasanhaider009@gmail.com" className="contact-detail-item">
                  <div className="icon-wrapper">
                    <Mail size={24} />
                  </div>
                  <div>
                    <span className="detail-label">Email Me</span>
                    <span className="detail-value">hasanhaider009@gmail.com</span>
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
              <form onSubmit={handleSubmit} noValidate>
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
      <div className={`toast ${showToast ? '' : 'hidden'}`}>
        <div className="toast-content">
          <CheckCircle className="toast-icon text-success" size={20} />
          <div className="toast-message">
            <span className="toast-title">Success!</span>
            <span className="toast-body">Your message has been sent. Thank you!</span>
          </div>
          <button className="toast-close-btn" onClick={() => setShowToast(false)}>
            <X size={20} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Contact;
