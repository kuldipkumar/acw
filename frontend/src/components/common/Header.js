import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';
import logo from '../../assets/acw-logo.jpeg';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    window.location.reload(); // to refresh the page and update the UI
  };
  return (
    <header className="header">
      <div className="logo-container">
        <NavLink to="/">
          <img src={logo} alt="Alka's CakeWalk Logo" className="logo" />
        </NavLink>
      </div>
      <nav className="main-nav">
        <ul>
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/menu">Menu</NavLink></li>
          <li><NavLink to="/gallery">Gallery</NavLink></li>
          <li><NavLink to="/contact">Contact</NavLink></li>
          {isLoggedIn && <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>}
        </ul>
      </nav>
      <div className="header-actions">
        <div className="social-icons">
          <a href="https://www.instagram.com/alkas_cake_walk_/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
          <a href="https://www.facebook.com/CakeWalk.HomeBakers" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
          <a href="https://wa.me/918668281565" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i className="fab fa-whatsapp"></i></a>
        </div>
              </div>
    </header>
  );
};

export default Header;
