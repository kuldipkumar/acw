import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

// Hero image - elegant single image (will be moved to S3 in future)
const heroImage = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=2089&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleExploreClick = () => {
    navigate('/gallery');
  };

  return (
    <section className="hero-section">
      {/* Elegant Diwali Banner */}
      <div className="diwali-banner">
        <div className="banner-content">
          <div className="banner-icon">🪔</div>
          <div className="banner-text-group">
            <h2 className="banner-greeting">Happy Diwali</h2>
            <p className="banner-milestone">Celebrating 5 Years of Sweetness</p>
          </div>
          <div className="banner-icon">🪔</div>
        </div>
      </div>

      {/* Hero Content Container */}
      <div className="hero-main-content">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="golden-text">ARTISTRY IN</span>
            <span className="golden-text">EVERY BITE.</span>
          </h1>
          <p className="hero-subtitle">
            Celebrating 5 glorious years of crafting custom cakes with passion, precision, and the finest ingredients. 
            This Diwali, let us add sweetness to your festivities!
          </p>
          <div className="hero-buttons">
            <button className="hero-cta-btn primary" onClick={handleExploreClick}>
              Explore Our Creations
            </button>
            <button className="hero-cta-btn secondary" disabled>
              Diwali Special
            </button>
          </div>
        </div>
        <div className="hero-image-container">
          <div className="image-glow">
            <img src={heroImage} alt="Exquisite CakeWalk Creation" className="hero-main-image" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
