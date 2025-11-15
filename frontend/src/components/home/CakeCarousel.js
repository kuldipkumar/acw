import React from 'react';
import Slider from 'react-slick';
import { NavLink } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './CakeCarousel.css';
import { NextArrow, PrevArrow } from './CustomArrows';
import ImageModal from '../ImageModal';

const CakeCarousel = () => {
  const [cakes, setCakes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedCake, setSelectedCake] = React.useState(null);

  React.useEffect(() => {
    const fetchCakes = async () => {
      try {
        // Use local backend during development; CRA proxy will route /api to backend
        const baseUrl = process.env.REACT_APP_API_BASE_URL
        const response = await fetch(`${baseUrl}/cakes`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log('API Response:', result); // Log the variable, not the function call
        // The body from a REST API Lambda proxy is often a string, so we need to parse it again.
        const data = typeof result.body === 'string' ? JSON.parse(result.body) : result;
        
        console.log('=== CAROUSEL DEBUG ===');
        console.log('Total images fetched:', data.length);
        console.log('First 3 images showInCarousel values:', data.slice(0, 3).map(c => ({
          name: c.name,
          showInCarousel: c.showInCarousel,
          type: typeof c.showInCarousel
        })));
        
        // Filter to show only images marked for carousel, limit to 10
        // Temporary: if showInCarousel is undefined (old images), include them
        const carouselCakes = data
          .filter(cake => {
            const shouldShow = cake.showInCarousel === true || cake.showInCarousel === undefined;
            if (shouldShow) {
              console.log('✓ Including in carousel:', cake.name, '(showInCarousel:', cake.showInCarousel, ')');
            }
            return shouldShow;
          })
          .slice(0, 10);
        
        console.log(`Filtered ${carouselCakes.length} carousel cakes from ${data.length} total`);
        console.log('=== END CAROUSEL DEBUG ===');
        setCakes(carouselCakes);
      } catch (e) {
        console.error('Failed to fetch cakes:', e);
        setError(e.message || 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    };

    fetchCakes();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: false,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          centerMode: false,
          arrows: true,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          centerMode: false,
          arrows: true,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: false,
          arrows: false,
          dots: true,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: false,
          arrows: false,
          dots: true,
        }
      },
    ],
  };

  if (loading) {
    return <section className="carousel-section"><p>Loading cakes...</p></section>;
  }

  if (error) {
    return <section className="carousel-section"><p>Error loading cakes: {error}</p></section>;
  }

  const handleNext = () => {
    const currentIndex = cakes.findIndex(c => c.id === selectedCake.id);
    const nextIndex = (currentIndex + 1) % cakes.length;
    setSelectedCake(cakes[nextIndex]);
  };

  const handlePrev = () => {
    const currentIndex = cakes.findIndex(c => c.id === selectedCake.id);
    const prevIndex = (currentIndex - 1 + cakes.length) % cakes.length;
    setSelectedCake(cakes[prevIndex]);
  };

  return (
    <section className="carousel-section">
      <div className="carousel-container">
        {cakes.length > 0 ? (
          <Slider {...settings}>
            {cakes.map(cake => (
              <div key={cake.id} className="cake-slide">
                <div 
                  className="cake-card"
                  onClick={() => setSelectedCake(cake)}
                  onDoubleClick={() => setSelectedCake(cake)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={cake.src} 
                    alt={cake.alt} 
                    className="cake-image"
                    loading="lazy"
                  />
                  <div className="cake-info">
                    <h3 className="cake-name">{cake.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <p>No cakes to display at the moment.</p>
        )}
      </div>
      <div className="section-footer">
        <NavLink to="/gallery" className="view-all-btn">View All Creations</NavLink>
      </div>
      
      {/* Modal for selected cake - using same component as gallery */}
      {selectedCake && (
        <ImageModal 
          cake={selectedCake} 
          onClose={() => setSelectedCake(null)} 
          onNext={handleNext} 
          onPrev={handlePrev} 
        />
      )}
    </section>
  );
};

export default CakeCarousel;
