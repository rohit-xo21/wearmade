import { useState } from 'react';
import api from '../api/axios';

const RatingForm = ({ orderId, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/orders/${orderId}/review`, {
        rating,
        comment
      });
      
      alert('Review submitted successfully!');
      onRatingSubmitted();
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h3>Rate Your Experience</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Rating:</label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star ${star <= rating ? 'filled' : ''}`}
                onClick={() => setRating(star)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: star <= rating ? '#ffc107' : '#ddd'
                }}
              >
                ★
              </button>
            ))}
            <span style={{ marginLeft: '10px' }}>
              {rating > 0 && `${rating} star${rating > 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label>Comment (Optional):</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows="3"
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={submitting || rating === 0}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default RatingForm;
