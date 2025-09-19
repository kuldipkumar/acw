import React from 'react';
import './Testimonials.css';

const Testimonials = () => {
  const [reviews, setReviews] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = data?.reviews || [];
        if (isMounted) setReviews(items);
      } catch (e) {
        console.error('Failed to fetch reviews', e);
        if (isMounted) setError('Unable to load reviews right now.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchReviews();
    return () => { isMounted = false; };
  }, []);

  const fallback = [
    {
      id: 'fallback-1',
      text: "Absolutely loved the cake! Beautifully crafted and tasted amazing.",
      author: "Happy Customer",
      profile_photo_url: 'https://via.placeholder.com/64',
      rating: 5,
      relative_time_description: 'Recently'
    }
  ];

  const list = reviews.length > 0 ? reviews : fallback;

  const renderStars = (rating = 5) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`fa${i <= Math.round(rating) ? 's' : 'r'} fa-star`}
          style={{ color: 'var(--accent-color)', marginRight: 2 }}
          aria-hidden="true"
        />
      );
    }
    return <span className="review-stars" aria-label={`Rating ${rating} out of 5`}>{stars}</span>;
  };

  return (
    <section className="testimonials-section">
      <div className="section-header">
        <h2 className="section-title">Sweet Words From Our Clients</h2>
        <p className="section-subtitle">We love making our clients happy. Here’s what they have to say about their CakeWalk experience.</p>
      </div>
      {loading ? (
        <div className="testimonials-container"><p>Loading reviews...</p></div>
      ) : error ? (
        <div className="testimonials-container"><p>{error}</p></div>
      ) : (
        <div className="testimonials-container">
          {list.map((r) => (
            <div key={r.id} className="testimonial-card">
              <p className="testimonial-quote">{r.text}</p>
              <div className="testimonial-author">
                <img src={r.profile_photo_url || 'https://via.placeholder.com/64'} alt={r.author} className="author-avatar" />
                <div className="author-info">
                  <span className="author-name">{r.author}</span>
                  <span className="author-handle">{r.relative_time_description || ''}</span>
                  <div className="author-rating">{renderStars(r.rating)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Testimonials;
