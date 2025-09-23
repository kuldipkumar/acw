import React from 'react';
import './HeroSection.css';

// Hero image - elegant single image (will be moved to S3 in future)
const heroImage = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=2089&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          <span>ARTISTRY IN</span>
          <span>EVERY BITE.</span>
        </h1>
        <p className="hero-subtitle">
          Experience custom cakes crafted with passion, precision, and the finest ingredients.
        </p>
        <button className="hero-cta-btn">Explore Our Creations</button>
      </div>
      <div className="hero-image-container">
        <img src={heroImage} alt="Exquisite CakeWalk Creation" className="hero-main-image" />
      </div>
    </section>
  );
};

export default HeroSection;
