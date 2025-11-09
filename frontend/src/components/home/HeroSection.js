import React, { useState, useEffect } from 'react';
import './HeroSection.css';

// Fallback hero image if S3 fetch fails
const fallbackHeroImage = 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?q=80&w=2000&auto=format&fit=crop';

const HeroSection = () => {
  const [heroImage, setHeroImage] = useState(fallbackHeroImage);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const baseUrl = process.env.REACT_APP_API_BASE_URL;
        const response = await fetch(`${baseUrl}/cakes`);
        if (!response.ok) throw new Error('Failed to fetch images');
        const data = await response.json();
        
        if (data && data.length > 0) {
          // Find image marked as landing image
          const landingImage = data.find(cake => cake.isLandingImage === true);
          
          if (landingImage) {
            setHeroImage(landingImage.url);
          } else {
            // Fallback to first image if no landing image is set
            setHeroImage(data[0].url);
          }
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        // Keep fallback image
      }
    };
    fetchImages();
  }, []);

  return (
    <section className="hero-section">
      {/* Large Hero Image */}
      <div className="hero-image-wrapper">
        <img src={heroImage} alt="Exquisite CakeWalk Creation" className="hero-featured-image" />
      </div>
      
      {/* Hero Content Below Image */}
      <div className="hero-content-center">
        <h1 className="hero-title">
          <span className="hero-title-main">Artistry in Every Bite</span>
        </h1>
        <p className="hero-subtitle">
          Celebrating 5 glorious years of crafting custom cakes with passion, precision, and the finest ingredients.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
