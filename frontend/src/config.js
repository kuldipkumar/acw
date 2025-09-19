// Centralized frontend configuration
// API_BASE resolves to process.env.REACT_APP_API_BASE when provided, otherwise falls back to '/api'
// This allows using CRA dev proxy locally and CloudFront path routing in production without extra config.

export const API_BASE = process.env.REACT_APP_API_BASE || '/api';
