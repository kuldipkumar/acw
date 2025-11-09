import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './ImageModal.css';

const ImageModal = ({ cake, onClose, onNext, onPrev }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (!cake) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <button className="nav-arrow prev" onClick={onPrev}>&#10094;</button>
        
        <img src={cake.src} alt={cake.alt} className="modal-image" />
        
        <button className="nav-arrow next" onClick={onNext}>&#10095;</button>

        <div className="modal-info">
          <h2>{cake.name}</h2>
          {cake.tags && cake.tags.length > 0 && (
            <div className="modal-tags">
              {cake.tags.map(tag => (
                <span key={tag} className="modal-tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default ImageModal;
