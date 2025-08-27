import React from 'react';
import './ContactPage.css';

const ContactPage = () => {
  const socialLinks = {
    whatsapp: 'https://wa.me/918668281565',
    instagram: 'https://www.instagram.com/alkas_cake_walk',
    email: 'mailto:alkascakewalk@gmail.com',
    youtube: '#' // Placeholder
  };

  return (
    <div className="contact-page">
      <h1 className="page-title">Get In Touch</h1>
      <div className="contact-container">
        <div className="contact-info">
          <h3>Contact Information</h3>
          <div className="info-item">
            <i className="fas fa-phone"></i>
            <span>+91 866 828 1565</span>
          </div>
          <div className="info-item">
            <i className="fas fa-envelope"></i>
            <span>alkascakewalk@gmail.com</span>
          </div>
          <div className="info-item">
            <i className="fab fa-whatsapp"></i>
            <span>+91 866 828 1565</span>
          </div>
          <div className="social-links-contact">
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
            <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>
          </div>
        </div>
        <div className="contact-form-section">
          <h3>Send a Message</h3>
          <p>Have a question or a special request? Feel free to reach out! For custom orders, the best way to get in touch is by sending a message on WhatsApp with your ideas and reference images.</p>
          <a href={socialLinks.whatsapp} className="hero-cta-btn" style={{marginTop: '20px', display: 'inline-block'}}>Chat on WhatsApp</a>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
