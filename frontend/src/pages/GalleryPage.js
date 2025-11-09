import React, { useState, useEffect } from 'react';
import EditImageModal from '../components/EditImageModal';
import ImageModal from '../components/ImageModal';
import './GalleryPage.css';

const GalleryPage = ({ isAdminMode = false }) => {
  const [cakes, setCakes] = useState([]);
  const [filteredCakes, setFilteredCakes] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [allTags, setAllTags] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const [selectedCake, setSelectedCake] = useState(null);
    const [editingCake, setEditingCake] = useState(null);
      const [authToken] = useState(localStorage.getItem('adminToken'));

  
  useEffect(() => {
    const fetchCakes = async () => {
      try {
        const baseUrl = process.env.REACT_APP_API_BASE_URL;
        const response = await fetch(`${baseUrl}/cakes`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setCakes(data);
        setFilteredCakes(data);
        const uniqueTags = new Set(['All']);
        data.forEach(cake => {
          if (cake.tags && Array.isArray(cake.tags)) {
            cake.tags.forEach(tag => uniqueTags.add(tag));
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

  useEffect(() => {
    if (activeFilter === 'All') {
      setFilteredCakes(cakes);
    } else {
      const filtered = cakes.filter(cake => cake.tags && cake.tags.includes(activeFilter));
      setFilteredCakes(filtered);
    }
  }, [activeFilter, cakes]);

  const handleSave = async (id, updatedData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cakes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error('Failed to update metadata');

      const updatedCakes = cakes.map(c => (c.id === id ? { ...c, ...updatedData, name: updatedData.title, tags: Array.isArray(updatedData.tags) ? updatedData.tags : updatedData.tags.split(',').map(t=>t.trim()) } : c));
      setCakes(updatedCakes);
      setEditingCake(null);
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message);
    }
  };

  if (loading) return <div className="gallery-page"><div className="loading-container"><p>Loading our delicious creations...</p></div></div>;
    if (error) return <div className="gallery-page"><div className="error-container"><p>Error loading gallery: {error}</p></div></div>;

  const handleNext = () => {
    const currentIndex = filteredCakes.findIndex(c => c.id === selectedCake.id);
    const nextIndex = (currentIndex + 1) % filteredCakes.length;
    setSelectedCake(filteredCakes[nextIndex]);
  };

  const handlePrev = () => {
    const currentIndex = filteredCakes.findIndex(c => c.id === selectedCake.id);
    const prevIndex = (currentIndex - 1 + filteredCakes.length) % filteredCakes.length;
    setSelectedCake(filteredCakes[prevIndex]);
  };

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
          <div key={cake.id} className="gallery-item">
            <div className="gallery-image-container" onClick={() => setSelectedCake(cake)}>
              <img src={cake.src} alt={cake.alt} className="gallery-image" />
              <div className="gallery-overlay">
                <h3 className="gallery-cake-name">{cake.name}</h3>
                {cake.tags && cake.tags.length > 0 && (
                  <div className="gallery-tags">
                    {cake.tags.map(tag => <span key={tag} className="gallery-tag">#{tag}</span>)}
                  </div>
                )}
              </div>
            </div>
            {(authToken || isAdminMode) && (
              <button className="edit-btn" onClick={(e) => { e.stopPropagation(); setEditingCake(cake); }}>
                Edit
              </button>
            )}
          </div>
        ))}
      </div>
      
      {filteredCakes.length === 0 && (
        <div className="no-results">
          <p>No cakes found for "{activeFilter}". Try a different filter!</p>
        </div>
      )}
      
            {selectedCake && (
        <ImageModal 
          cake={selectedCake} 
          onClose={() => setSelectedCake(null)} 
          onNext={handleNext} 
          onPrev={handlePrev} 
        />
      )}

      {editingCake && (
        <EditImageModal 
          image={editingCake} 
          onClose={() => setEditingCake(null)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
};

export default GalleryPage;
