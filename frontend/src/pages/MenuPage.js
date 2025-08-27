import React from 'react';
import './MenuPage.css';

const celebrationCakes = [
  'Dark Chocolate Truffle',
  'Nutella Choco Truffle',
  'Black Forest',
  'Paan',
  'Oreo',
  'Strawberry',
  'Vanilla Delight',
  'Rose',
  'Rasmalai',
  'Mixed Fruit',
  'Pineapple',
  'White Forest',
  'Pista',
  'Dutch Truffle',
  'Ferrero Rocher',
  'Blueberry',
  'Belgian Chocolate',
];

const cupcakes = [
  'Chocolate',
  'Vanilla',
  'Choco Chips',
  'Fruits',
  'Brownie',
  'Walnut',
];

const MenuPage = () => {
  return (
    <div className="menu-page">
      <h1 className="page-title">Our Menu</h1>
      <div className="menu-container">
        <div className="menu-columns">
          <div className="menu-column">
            <h2 className="menu-category">Celebration Cake Flavours</h2>
            <ul className="menu-list">
              {celebrationCakes.map((cake, index) => (
                <li key={index} className="menu-item">{cake}</li>
              ))}
            </ul>
          </div>
          <div className="menu-column">
            <h2 className="menu-category">Cupcake Flavours</h2>
            <ul className="menu-list">
              {cupcakes.map((cupcake, index) => (
                <li key={index} className="menu-item">{cupcake}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="about-section">
          <h2 className="menu-category">About Us</h2>
          <p>A home baker. "Baking is fun and Passion both."</p>
          <h3 className="order-info">To order, call us on: <strong>8668281565</strong></h3>
          <ul>
            <li>Pickups only.</li>
            <li>Accepts advance orders only.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
