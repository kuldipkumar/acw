import React, { useState } from 'react';
import { uploadToS3 } from '../services/s3Service';
import './AdminPage.css';

const AdminPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [metadata, setMetadata] = useState({
    title: '',
    tags: ''
  });

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setMetadata(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setUploadStatus('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading...');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile); // Use 'image' to match Postman test

      // Append each metadata field separately
      for (const key in metadata) {
        formData.append(key, metadata[key]);
      }

      await uploadToS3(formData);
      setUploadStatus('Upload successful!');
      // Reset form
      setSelectedFile(null);
      setMetadata({
        title: '',
        tags: ''
      });
      document.getElementById('file-upload').value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <div className="upload-section">
        <h2>Upload Image</h2>
        <form onSubmit={handleSubmit} className="upload-form">
          
          <div className="form-group">
            <label>Image File:</label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={metadata.title}
              onChange={handleMetadataChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>Tags (comma separated):</label>
            <input
              type="text"
              name="tags"
              value={metadata.tags}
              onChange={handleMetadataChange}
              className="form-control"
              placeholder="e.g., birthday, chocolate, wedding"
              required
            />
          </div>

          <button 
            type="submit" 
            className="upload-button"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
          
          {uploadStatus && (
            <div className={`status-message ${uploadStatus.includes('failed') ? 'error' : 'success'}`}>
              {uploadStatus}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminPage;
