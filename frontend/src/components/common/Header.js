import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';
import logo from '../../assets/acw-logo.jpeg';

const Header = () => {
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
        </ul>
      </nav>
      <div className="header-actions">
        <div className="social-icons">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
        </div>
        <button className="shop-now-btn">Shop Now</button>
      </div>
    </header>
  );
};

export default Header;
