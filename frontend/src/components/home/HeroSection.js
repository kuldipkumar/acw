import React from 'react';
import './HeroSection.css';

// Using working images (local files are empty placeholders)
const cakeImage1 = 'https://images.unsplash.com/photo-1627834377411-8da5f4f09de8?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
const cakeImage2 = 'https://images.unsplash.com/photo-1627834377411-8da5f4f09de8?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
const cakeImage3 = 'https://images.unsplash.com/photo-1559620192-032c4bc4674e?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

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
      <div className="hero-images">
        <img src={cakeImage1} alt="Artisan Cake 1" className="hero-img hero-img-1" />
        <img src={cakeImage2} alt="Artisan Cake 2" className="hero-img hero-img-2" />
        <img src={cakeImage3} alt="Artisan Cake 3" className="hero-img hero-img-3" />
      </div>
    </section>
  );
};

export default HeroSection;
