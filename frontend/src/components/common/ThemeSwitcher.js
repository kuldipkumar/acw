import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './ThemeSwitcher.css';

const ThemeSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');

  const themes = useMemo(() => [
    {
      name: 'default',
      colors: {
        '--background-color': '#fdfcf8',
        '--secondary-color': '#f9f9f9',
        '--primary-color': '#212529',
        '--primary-color-light': '#6c757d',
        '--accent-color': '#d92691',
        '--accent-hover-color': '#b91c7a'
      },
      displayColor: '#d92691'
    },
    {
      name: 'ocean',
      colors: {
        '--background-color': '#f0f8ff',
        '--secondary-color': '#e6f3ff',
        '--primary-color': '#1e3a8a',
        '--primary-color-light': '#64748b',
        '--accent-color': '#0ea5e9',
        '--accent-hover-color': '#0284c7'
      },
      displayColor: '#0ea5e9'
    },
    {
      name: 'forest',
      colors: {
        '--background-color': '#f0f9f0',
        '--secondary-color': '#e8f5e8',
        '--primary-color': '#1f2937',
        '--primary-color-light': '#6b7280',
        '--accent-color': '#059669',
        '--accent-hover-color': '#047857'
      },
      displayColor: '#059669'
    },
    {
      name: 'sunset',
      colors: {
        '--background-color': '#fff7ed',
        '--secondary-color': '#ffedd5',
        '--primary-color': '#1f2937',
        '--primary-color-light': '#6b7280',
        '--accent-color': '#ea580c',
        '--accent-hover-color': '#dc2626'
      },
      displayColor: '#ea580c'
    },
    {
      name: 'lavender',
      colors: {
        '--background-color': '#faf5ff',
        '--secondary-color': '#f3e8ff',
        '--primary-color': '#1f2937',
        '--primary-color-light': '#6b7280',
        '--accent-color': '#8b5cf6',
        '--accent-hover-color': '#7c3aed'
      },
      displayColor: '#8b5cf6'
    }
  ], []);

  const applyTheme = useCallback((themeName) => {
    const theme = themes.find(t => t.name === themeName);
    if (theme) {
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
    }
  }, [themes]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'default';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, [applyTheme]);

  const handleThemeChange = (themeName) => {
    setCurrentTheme(themeName);
    applyTheme(themeName);
    localStorage.setItem('theme', themeName);
    setIsOpen(false);
  };

  return (
    <div className="theme-switcher">
      <button 
        className="theme-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change theme"
      >
        <i className="fas fa-palette"></i>
      </button>
      
      {isOpen && (
        <div className="theme-options">
          {themes.map((theme) => (
            <button
              key={theme.name}
              className={`theme-option ${currentTheme === theme.name ? 'active' : ''}`}
              style={{ backgroundColor: theme.displayColor }}
              onClick={() => handleThemeChange(theme.name)}
              aria-label={`Switch to ${theme.name} theme`}
              title={theme.name.charAt(0).toUpperCase() + theme.name.slice(1)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
