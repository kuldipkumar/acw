import React from 'react';
import { NavLink } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const socialLinks = {
    whatsapp: 'https://wa.me/918668281565',
    instagram: 'https://www.instagram.com/alkas_cake_walk_/',
    email: 'mailto:alkascakewalk@gmail.com',
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h2 className="brand-name-footer">Alka's CakeWalk</h2>
          <p className="brand-tagline">Crafting sweet memories with every bite. Where passion meets perfection in custom cake artistry.</p>
          <div className="footer-socials">
            <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <i className="fab fa-whatsapp"></i>
            </a>
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href={socialLinks.email} aria-label="Email">
              <i className="fas fa-envelope"></i>
            </a>
          </div>
        </div>
        
        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/menu">Our Menu</NavLink></li>
            <li><NavLink to="/gallery">Gallery</NavLink></li>
            <li><NavLink to="/contact">Contact Us</NavLink></li>
          </ul>
        </div>
        
        <div className="footer-section contact">
          <h3>Get in Touch</h3>
          <div className="contact-info">
            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <span>+91 866 828 1565</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <span>alkascakewalk@gmail.com</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-clock"></i>
              <span>Mon - Sat: 9AM - 8PM</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Alka's CakeWalk. All rights reserved.</p>
        <p className="footer-credit">Made with <i className="fas fa-heart"></i> for sweet celebrations</p>
      </div>
    </footer>
  );
};

export default Footer;
