import React from 'react';
import './HeroSection.css';

// Hero image - elegant single image (will be moved to S3 in future)
const heroImage = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=2089&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="diwali-banner">
        <div className="diya-icon">🪔</div>
        <span className="diwali-text">Happy Diwali!</span>
        <div className="sparkle">✨</div>
        <span className="anniversary-text">Celebrating 5 Years of Sweetness</span>
        <div className="sparkle">✨</div>
        <div className="diya-icon">🪔</div>
      </div>
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
          <button className="hero-cta-btn primary">Explore Our Creations</button>
          <button className="hero-cta-btn secondary">Diwali Special</button>
        </div>
      </div>
      <div className="hero-image-container">
        <div className="image-glow">
          <img src={heroImage} alt="Exquisite CakeWalk Creation" className="hero-main-image" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
