import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const ExplorePage = () => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioItems();
  }, []);

  const fetchPortfolioItems = async () => {
    try {
      const response = await api.get('/portfolio?limit=12');
      setPortfolioItems(response.data.data.docs || []);
    } catch (error) {
      console.error('Failed to fetch portfolio items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <h1>Explore Portfolios</h1>
      <p>Discover amazing work from our talented tailors</p>
      
      <div className="card-grid">
        {portfolioItems.map(item => (
          <div key={item._id} className="card">
            <h3>{item.title}</h3>
            
            {/* Display first image as thumbnail */}
            {item.images && item.images.length > 0 && (
              <div style={{ margin: '10px 0' }}>
                <img 
                  src={item.images[0].url} 
                  alt={item.title}
                  style={{ 
                    width: '100%', 
                    maxHeight: '200px', 
                    objectFit: 'cover',
                    border: '1px solid #ccc'
                  }}
                />
                {item.images.length > 1 && (
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    +{item.images.length - 1} more images
                  </p>
                )}
              </div>
            )}
            
            <p>{item.description}</p>
            <p><strong>Category:</strong> {item.category}</p>
            <p><strong>Tailor:</strong> {item.tailor?.name}</p>
            {item.tailor?.shopName && <p><strong>Shop:</strong> {item.tailor.shopName}</p>}
            <p><strong>Price Range:</strong> ${item.priceRange?.min} - ${item.priceRange?.max}</p>
            <p><strong>Time to Complete:</strong> {item.timeToComplete} days</p>
            <p><strong>Views:</strong> {item.views || 0}</p>
            <p><strong>Likes:</strong> {item.likes?.length || 0}</p>
            
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <Link 
                to={`/tailor/${item.tailor._id}/portfolio`} 
                className="btn btn-primary"
              >
                View Tailor's Portfolio
              </Link>
              <Link 
                to={`/customer/new-order?tailorId=${item.tailor._id}`} 
                className="btn btn-success"
              >
                Request Quote
              </Link>
            </div>
          </div>
        ))}
      </div>

      {portfolioItems.length === 0 && (
        <div className="message info">No portfolio items found</div>
      )}
    </div>
  );
};

export default ExplorePage;