import React, { useState } from 'react';
import './MenuPage.css';
import cake1 from '../assets/cake1.jpg';
import cake2 from '../assets/cake2.jpg';
import cake3 from '../assets/cake3.jpg';
import cake4 from '../assets/cake4.jpg';
import cake5 from '../assets/cake5.jpg';
import cake6 from '../assets/cake6.jpg';
import cupcake1 from '../assets/cupcake1.jpg';
import cupcake2 from '../assets/cupcake2.jpg';
import cupcake3 from '../assets/cupcake3.jpg';
import cupcake4 from '../assets/cupcake4.jpg';
import cupcake5 from '../assets/cupcake5.jpg';
import cupcake6 from '../assets/cupcake6.jpg';
import cupcake7 from '../assets/cupcake7.jpg';
import cupcake8 from '../assets/cupcake8.jpg';
import cupcake9 from '../assets/cupcake9.jpg';
import cupcake10 from '../assets/cupcake10.jpg';

const cakeFlavours = [
  { name: 'Dark Chocolate Truffle', description: 'Rich, decadent chocolate layers with smooth truffle cream', image: cake1 },
  { name: 'Nutella Choco Truffle', description: 'Heavenly Nutella-infused chocolate delight', image: cake2 },
  { name: 'Black Forest', description: 'Classic chocolate cake with cherries and whipped cream', image: cake3 },
  { name: 'Paan', description: 'Unique Indian flavor with a refreshing twist', image: cake4 },
  { name: 'Oreo', description: 'Cookies and cream perfection in every bite', image: cake5 },
  { name: 'Strawberry', description: 'Fresh strawberry cream with soft vanilla sponge', image: cake6 },
  { name: 'Vanilla Delight', description: 'Pure vanilla bliss with creamy frosting', image: cake1 },
  { name: 'Rose', description: 'Delicate rose-flavored cake with floral notes', image: cake2 },
  { name: 'Rasmalai', description: 'Traditional Indian dessert in cake form', image: cake3 },
  { name: 'Mixed Fruit', description: 'Tropical fruits with light cream', image: cake4 },
  { name: 'Pineapple', description: 'Tangy pineapple with fluffy sponge', image: cake5 },
  { name: 'White Forest', description: 'White chocolate variant of the classic', image: cake6 },
  { name: 'Pista', description: 'Rich pistachio flavor with nuts', image: cake1 },
  { name: 'Dutch Truffle', description: 'Premium Dutch chocolate truffle', image: cake2 },
  { name: 'Ferrero Rocher', description: 'Hazelnut chocolate luxury', image: cake3 },
  { name: 'Blueberry', description: 'Fresh blueberries with cream cheese frosting', image: cake4 },
  { name: 'Belgian Chocolate', description: 'Premium Belgian chocolate indulgence', image: cake5 },
  { name: 'Red Velvet', description: 'Classic red velvet with cream cheese', image: cake6 },
  { name: 'Butterscotch', description: 'Caramel butterscotch delight', image: cake1 },
  { name: 'Coffee', description: 'Rich coffee-flavored layers', image: cake2 },
];

const cupcakeFlavours = [
  { name: 'Chocolate', description: 'Classic chocolate cupcake with rich frosting', image: cupcake1 },
  { name: 'Vanilla', description: 'Light and fluffy vanilla perfection', image: cupcake2 },
  { name: 'Choco Chips', description: 'Chocolate chip studded delight', image: cupcake3 },
  { name: 'Fruits', description: 'Fresh fruit-topped cupcakes', image: cupcake4 },
  { name: 'Brownie', description: 'Fudgy brownie-style cupcake', image: cupcake5 },
  { name: 'Walnut', description: 'Crunchy walnut goodness', image: cupcake6 },
  { name: 'Red Velvet', description: 'Mini red velvet with cream cheese', image: cupcake7 },
  { name: 'Lemon', description: 'Zesty lemon with tangy frosting', image: cupcake8 },
  { name: 'Caramel', description: 'Sweet caramel drizzle', image: cupcake9 },
  { name: 'Oreo', description: 'Cookies and cream mini delight', image: cupcake10 },
];

const MenuPage = () => {
  const [activeTab, setActiveTab] = useState('cakes');

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1 className="page-title">Our Flavours</h1>
        <p className="menu-subtitle">Handcrafted with love, baked to perfection</p>
      </div>

      {/* Tab Navigation */}
      <div className="menu-tabs">
        <button 
          className={`tab-btn ${activeTab === 'cakes' ? 'active' : ''}`}
          onClick={() => setActiveTab('cakes')}
        >
          Cake Flavours
        </button>
        <button 
          className={`tab-btn ${activeTab === 'cupcakes' ? 'active' : ''}`}
          onClick={() => setActiveTab('cupcakes')}
        >
          Cupcake Flavours
        </button>
      </div>

      {/* Flavour Cards Grid */}
      <div className="flavours-container">
        {activeTab === 'cakes' && (
          <div className="flavours-grid">
            {cakeFlavours.map((flavour, index) => (
              <div key={index} className="flavour-card">
                <div className="flavour-image-wrapper">
                  <img 
                    src={flavour.image} 
                    alt={flavour.name} 
                    className="flavour-image"
                    loading="lazy"
                  />
                </div>
                <h3 className="flavour-name">{flavour.name}</h3>
                <p className="flavour-description">{flavour.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'cupcakes' && (
          <div className="flavours-grid">
            {cupcakeFlavours.map((flavour, index) => (
              <div key={index} className="flavour-card">
                <div className="flavour-image-wrapper">
                  <img 
                    src={flavour.image} 
                    alt={flavour.name} 
                    className="flavour-image"
                    loading="lazy"
                  />
                </div>
                <h3 className="flavour-name">{flavour.name}</h3>
                <p className="flavour-description">{flavour.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Information */}
      <div className="order-section">
        <h2 className="order-title">How to Order</h2>
        <p className="order-description">
          To help us deliver you on time, we suggest you to place your order at least 48 hours in advance. 
          Please call to place the order. Orders are confirmed after 50% advance payment.
        </p>
        
        <div className="order-details">
          <div className="order-detail-item">
            <div className="detail-icon">📞</div>
            <div className="detail-content">
              <h3>Contact Number</h3>
              <p className="phone-number">8668281565</p>
              <p className="detail-note">Available for orders and inquiries</p>
            </div>
          </div>
          
          <div className="order-detail-item">
            <div className="detail-icon">⏰</div>
            <div className="detail-content">
              <h3>Advance Notice</h3>
              <p className="detail-highlight">Minimum 48 Hours</p>
              <p className="detail-note">For best quality and timely delivery</p>
            </div>
          </div>
          
          <div className="order-detail-item">
            <div className="detail-icon">💳</div>
            <div className="detail-content">
              <h3>Payment Terms</h3>
              <p className="detail-highlight">50% Advance Required</p>
              <p className="detail-note">Balance on pickup</p>
            </div>
          </div>
          
          <div className="order-detail-item">
            <div className="detail-icon">📍</div>
            <div className="detail-content">
              <h3>Pickup Only</h3>
              <p className="detail-highlight">Self Collection</p>
              <p className="detail-note">No delivery service available</p>
            </div>
          </div>
        </div>
        
        <p className="tagline">"Baking is fun and Passion both."</p>
      </div>
    </div>
  );
};

export default MenuPage;
