import React, { useState, useEffect } from 'react';
import { uploadToS3 } from '../services/s3Service';
import GalleryPage from './GalleryPage'; // We will reuse the gallery page component
import './AdminPage.css';

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [metadata, setMetadata] = useState({
    title: '',
    tags: '',
    isLandingImage: false,
    showInCarousel: false
  });

  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
    }
  }, []);

    const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('adminToken', data.token);
      setAuthToken(data.token);
      setIsAuthenticated(true);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAuthToken(null);
    setIsAuthenticated(false);
    setUploadStatus('');
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleMetadataChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMetadata(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

      // Clean tags: remove # symbols if user added them
      const cleanedMetadata = {
        ...metadata,
        tags: metadata.tags
          .split(',')
          .map(tag => tag.trim().replace(/^#+/, '')) // Remove leading # symbols
          .filter(tag => tag.length > 0) // Remove empty tags
          .join(',')
      };

      // Append each metadata field separately
      for (const key in cleanedMetadata) {
        formData.append(key, cleanedMetadata[key]);
      }

      await uploadToS3(formData, authToken);
      setUploadStatus('Upload successful!');
      // Reset form
      setSelectedFile(null);
      setMetadata({
        title: '',
        tags: '',
        isLandingImage: false,
        showInCarousel: false
      });
      document.getElementById('file-upload').value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

    if (!isAuthenticated) {
    return (
      <div className="admin-container login-form-container">
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>Upload</button>
        <button className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`} onClick={() => setActiveTab('gallery')}>Manage Gallery</button>
      </div>
      {activeTab === 'upload' ? (
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
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isLandingImage"
                  checked={metadata.isLandingImage}
                  onChange={handleMetadataChange}
                />
                <span>Set as Landing Page Hero Image</span>
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="showInCarousel"
                  checked={metadata.showInCarousel}
                  onChange={handleMetadataChange}
                />
                <span>Show in Carousel (Homepage)</span>
              </label>
            </div>
            <button type="submit" className="upload-button" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
            {uploadStatus && (
              <div className={`status-message ${uploadStatus.includes('failed') ? 'error' : 'success'}`}>
                {uploadStatus}
              </div>
            )}
          </form>
        </div>
      ) : (
        <div className="manage-gallery-section">
          <h2>Manage Gallery</h2>
          <GalleryPage isAdminMode={true} />
        </div>
      )}
    </div>
  );
};

export default AdminPage;
