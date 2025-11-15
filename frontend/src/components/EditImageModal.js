import React, { useState, useEffect } from 'react';
import './EditImageModal.css';

const EditImageModal = ({ image, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [isLandingImage, setIsLandingImage] = useState(false);
  const [showInCarousel, setShowInCarousel] = useState(false);

  useEffect(() => {
    if (image) {
      setTitle(image.name || '');
      setDescription(image.description || '');
      setCategory(image.category || '');
      setTags(Array.isArray(image.tags) ? image.tags.join(', ') : '');
      setIsLandingImage(image.isLandingImage || false);
      setShowInCarousel(image.showInCarousel || false);
    }
  }, [image]);

  if (!image) return null;

  const handleSave = () => {
    onSave(image.id, { 
      title, 
      description, 
      category, 
      tags: tags.split(',').map(t => t.trim()),
      isLandingImage,
      showInCarousel
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Image Details</h2>
        <img src={image.src} alt={image.alt} className="modal-image-preview" />
        <label>Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        <label>Category</label>
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
        <label>Tags (comma-separated)</label>
        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} />
        <div className="landing-image-toggle">
          <label>
            <input 
              type="checkbox" 
              checked={isLandingImage} 
              onChange={(e) => setIsLandingImage(e.target.checked)} 
            />
            <span>Set as Landing Page Hero Image</span>
          </label>
        </div>
        <div className="landing-image-toggle">
          <label>
            <input 
              type="checkbox" 
              checked={showInCarousel} 
              onChange={(e) => setShowInCarousel(e.target.checked)} 
            />
            <span>Show in Carousel (Homepage)</span>
          </label>
        </div>
        <div className="modal-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditImageModal;
