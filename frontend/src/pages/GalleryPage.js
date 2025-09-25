import React, { useState, useEffect } from 'react';
import './GalleryPage.css';

const GalleryPage = () => {
  const [cakes, setCakes] = useState([]);
  const [filteredCakes, setFilteredCakes] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [allTags, setAllTags] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCake, setSelectedCake] = useState(null);

  // Fetch cakes from API
  useEffect(() => {
    const fetchCakes = async () => {
      try {
        const baseUrl = process.env.REACT_APP_API_BASE_URL;
        const response = await fetch(`${baseUrl}/cakes`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        const data = typeof result.body === 'string' ? JSON.parse(result.body) : result;
        
        setCakes(data);
        setFilteredCakes(data);
        
        // Extract unique tags from all cakes
        const uniqueTags = new Set(['All']);
        data.forEach(cake => {
          if (cake.tags && Array.isArray(cake.tags)) {
            cake.tags.forEach(tag => uniqueTags.add(tag));
          }
          if (cake.category) {
            uniqueTags.add(cake.category);
          }
        });
        setAllTags(Array.from(uniqueTags));
        
      } catch (e) {
        console.error('Failed to fetch cakes:', e);
        setError(e.message || 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    };

    fetchCakes();
  }, []);

  // Filter cakes based on active filter
  useEffect(() => {
    if (activeFilter === 'All') {
      setFilteredCakes(cakes);
    } else {
      const filtered = cakes.filter(cake => {
        const matchesTag = cake.tags && cake.tags.includes(activeFilter);
        const matchesCategory = cake.category === activeFilter;
        return matchesTag || matchesCategory;
      });
      setFilteredCakes(filtered);
    }
  }, [activeFilter, cakes]);

  if (loading) {
    return (
      <div className="gallery-page">
        <div className="loading-container">
          <p>Loading our delicious creations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-page">
        <div className="error-container">
          <p>Error loading gallery: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-page">
      <div className="gallery-header">
        <h1 className="page-title">Our Gallery</h1>
        <p className="gallery-subtitle">Explore our collection of handcrafted cakes, each made with love and attention to detail.</p>
      </div>
      
      <div className="filter-bar">
        {allTags.map(tag => (
          <button
            key={tag}
            className={`filter-btn ${activeFilter === tag ? 'active' : ''}`}
            onClick={() => setActiveFilter(tag)}
          >
            {tag === 'All' ? 'All Cakes' : `#${tag}`}
          </button>
        ))}
      </div>
      
      <div className="gallery-stats">
        <p>Showing {filteredCakes.length} of {cakes.length} cakes</p>
      </div>
      
      <div className="gallery-grid">
        {filteredCakes.map(cake => (
          <div 
            key={cake.id} 
            className="gallery-item"
            onClick={() => setSelectedCake(cake)}
          >
            <div className="gallery-image-container">
              <img src={cake.src} alt={cake.alt} className="gallery-image" />
              <div className="gallery-overlay">
                <h3 className="gallery-cake-name">{cake.name}</h3>
                <p className="gallery-cake-description">{cake.description}</p>
                {cake.tags && cake.tags.length > 0 && (
                  <div className="gallery-tags">
                    {cake.tags.map(tag => (
                      <span key={tag} className="gallery-tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredCakes.length === 0 && (
        <div className="no-results">
          <p>No cakes found for "{activeFilter}". Try a different filter!</p>
        </div>
      )}
      
      {/* Modal for selected cake */}
      {selectedCake && (
        <div className="modal-overlay" onClick={() => setSelectedCake(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedCake(null)}>×</button>
            <img src={selectedCake.src} alt={selectedCake.alt} className="modal-image" />
            <div className="modal-info">
              <h2>{selectedCake.name}</h2>
              <p>{selectedCake.description}</p>
              {selectedCake.category && (
                <p><strong>Category:</strong> {selectedCake.category}</p>
              )}
              {selectedCake.tags && selectedCake.tags.length > 0 && (
                <div className="modal-tags">
                  <strong>Tags:</strong>
                  {selectedCake.tags.map(tag => (
                    <span key={tag} className="modal-tag">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
