import React from 'react';
import HeroSection from '../components/home/HeroSection';
import CakeCarousel from '../components/home/CakeCarousel';
import Testimonials from '../components/home/Testimonials';

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <CakeCarousel />
      <Testimonials />
    </div>
  );
};

export default HomePage;
