import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const TailorPortfolio = () => {
  const [tailor, setTailor] = useState(null);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    fetchTailorData();
  }, [id]);

  const fetchTailorData = async () => {
    try {
      const [tailorRes, portfolioRes] = await Promise.all([
        api.get(`/users/tailors/${id}`),
        api.get(`/portfolio/tailor/${id}`)
      ]);
      
      setTailor(tailorRes.data.data);
      setPortfolioItems(portfolioRes.data.data.docs || []);
    } catch (error) {
      console.error('Failed to fetch tailor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!tailor) return <div className="message error">Tailor not found</div>;

  return (
    <div className="container">
      {/* Tailor Profile Header */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
          {tailor.avatar && (
            <img 
              src={tailor.avatar} 
              alt={tailor.name}
              style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                objectFit: 'cover' 
              }}
            />
          )}
          <div>
            <h1>{tailor.name}</h1>
            {tailor.shopName && <h2>{tailor.shopName}</h2>}
            <p><strong>Rating:</strong> {tailor.rating?.average || 0}/5 ({tailor.rating?.count || 0} reviews)</p>
            <p><strong>Experience:</strong> {tailor.experience || 0} years</p>
            {tailor.specialties && tailor.specialties.length > 0 && (
              <p><strong>Specialties:</strong> {tailor.specialties.join(', ')}</p>
            )}
          </div>
        </div>
        
        {tailor.shopAddress && (
          <div>
            <h3>Location</h3>
            <p>
              {tailor.shopAddress.street && `${tailor.shopAddress.street}, `}
              {tailor.shopAddress.city && `${tailor.shopAddress.city}, `}
              {tailor.shopAddress.state && `${tailor.shopAddress.state}, `}
              {tailor.shopAddress.country}
            </p>
          </div>
        )}

        {tailor.priceRange && (
          <div>
            <h3>Price Range</h3>
            <p>${tailor.priceRange.min} - ${tailor.priceRange.max}</p>
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          <Link to={`/customer/new-order?tailorId=${id}`} className="btn btn-primary">
            Request Quote
          </Link>
          <Link to="/customer/tailors" className="btn">
            Back to Tailors
          </Link>
        </div>
      </div>

      {/* Portfolio Items */}
      <div className="card">
        <h2>Portfolio ({portfolioItems.length} items)</h2>
        
        {portfolioItems.length > 0 ? (
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
                {item.tags && item.tags.length > 0 && (
                  <p><strong>Tags:</strong> {item.tags.join(', ')}</p>
                )}
                {item.materials && item.materials.length > 0 && (
                  <p><strong>Materials:</strong> {item.materials.join(', ')}</p>
                )}
                <p><strong>Price Range:</strong> ${item.priceRange?.min} - ${item.priceRange?.max}</p>
                <p><strong>Time to Complete:</strong> {item.timeToComplete} days</p>
                <p><strong>Views:</strong> {item.views || 0}</p>
                <p><strong>Likes:</strong> {item.likes?.length || 0}</p>
                <p><strong>Created:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="message info">
            This tailor hasn't added any portfolio items yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default TailorPortfolio;
