import React, { useState, useEffect } from 'react';
import './GalleryPage.css';


// Placeholder data - replace with your actual cake data
const allCakes = [
  { id: 1, src: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', tags: ['chocolate', 'birthday'] },
  { id: 2, src: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', tags: ['vanilla', 'anniversary'] },
  { id: 3, src: 'https://images.unsplash.com/photo-1559620192-032c4bc4674e?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', tags: ['themecakes', 'kids'] },
  { id: 4, src: 'https://images.unsplash.com/photo-1627834377411-8da5f4f09de8?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', tags: ['fruit', 'birthday'] },
  { id: 5, src: 'https://images.unsplash.com/photo-1519869325930-2813a4451b69?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', tags: ['themecakes', 'chocolate'] },
  { id: 6, src: 'https://images.unsplash.com/photo-1616690710400-a15d41ab6420?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', tags: ['anniversary', 'vanilla'] },
];

const allTags = ['All', 'birthday', 'anniversary', 'themecakes', 'chocolate', 'vanilla', 'fruit', 'kids'];

const GalleryPage = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [filteredCakes, setFilteredCakes] = useState(allCakes);

  useEffect(() => {
    if (activeFilter === 'All') {
      setFilteredCakes(allCakes);
    } else {
      const filtered = allCakes.filter(cake =>
        cake.tags.includes(activeFilter)
      );
      setFilteredCakes(filtered);
    }
  }, [activeFilter]);

  return (
    <div className="gallery-page">
      <h1 className="page-title">Our Gallery</h1>
      <div className="filter-bar">
        {allTags.map(tag => (
          <button
            key={tag}
            className={`filter-btn ${activeFilter === tag ? 'active' : ''}`}
            onClick={() => setActiveFilter(tag)}
          >
            #{tag}
          </button>
        ))}
      </div>
      <div className="gallery-grid">
        {filteredCakes.map(cake => (
          <div key={cake.id} className="gallery-item">
            <img src={cake.src} alt={`Cake ${cake.id}`} className="gallery-image" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryPage;
