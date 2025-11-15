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
      <button 
        className="modal-close" 
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        ×
      </button>
      <button 
        className="nav-arrow prev" 
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
      >
        &#10094;
      </button>
      <button 
        className="nav-arrow next" 
        onClick={(e) => { e.stopPropagation(); onNext(); }}
      >
        &#10095;
      </button>
      
      <img 
        src={cake.src} 
        alt={cake.alt} 
        className="modal-image"
        onClick={e => e.stopPropagation()}
      />
    </div>,
    document.getElementById('modal-root')
  );
};

export default ImageModal;
