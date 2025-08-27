import React from 'react';
import './Testimonials.css';

const Testimonials = () => {
  const testimonialsData = [
    {
      id: 1,
      quote: "The cake was a masterpiece! Absolutely stunning and tasted even better. You made our celebration unforgettable.",
      author: "Priya Sharma",
      handle: "@priya_sh",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 2,
      quote: "Incredible artistry and flavor. Alka's CakeWalk is my go-to for every special occasion. Never disappoints!",
      author: "Rahul Mehta",
      handle: "@rahul_m",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 3,
      quote: "The most beautiful and delicious cake I have ever seen. The craftsmanship is just out of this world. Thank you!",
      author: "Anjali Kapoor",
      handle: "@anjalikapoor",
      avatar: "https://randomuser.me/api/portraits/women/47.jpg"
    }
  ];

  return (
    <section className="testimonials-section">
      <div className="section-header">
        <h2 className="section-title">Sweet Words From Our Clients</h2>
        <p className="section-subtitle">We love making our clients happy. Here’s what they have to say about their CakeWalk experience.</p>
      </div>
      <div className="testimonials-container">
        {testimonialsData.map(testimonial => (
          <div key={testimonial.id} className="testimonial-card">
            <p className="testimonial-quote">{testimonial.quote}</p>
            <div className="testimonial-author">
              <img src={testimonial.avatar} alt={testimonial.author} className="author-avatar" />
              <div className="author-info">
                <span className="author-name">{testimonial.author}</span>
                <span className="author-handle">{testimonial.handle}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
