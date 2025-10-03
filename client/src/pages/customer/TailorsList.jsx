import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const TailorsList = () => {
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTailors();
  }, []);

  const fetchTailors = async () => {
    try {
      const response = await api.get('/users/tailors');
      setTailors(response.data.data.docs || []);
    } catch (error) {
      console.error('Failed to fetch tailors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <h1>Browse Tailors</h1>
      
      <div className="card-grid">
        {tailors.map(tailor => (
          <div key={tailor._id} className="card">
            <h3>{tailor.name}</h3>
            {tailor.shopName && <h4>{tailor.shopName}</h4>}
            <p>Rating: {tailor.rating?.average || 0}/5 ({tailor.rating?.count || 0} reviews)</p>
            {tailor.specialties && tailor.specialties.length > 0 && (
              <p>Specialties: {tailor.specialties.join(', ')}</p>
            )}
            <p>Available: {tailor.isAvailable ? 'Yes' : 'No'}</p>
            {tailor.experience && <p>Experience: {tailor.experience} years</p>}
            
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <Link 
                to={`/tailor/${tailor._id}/portfolio`} 
                className="btn btn-primary"
              >
                View Portfolio
              </Link>
              <Link 
                to={`/customer/new-order?tailorId=${tailor._id}`} 
                className="btn btn-success"
              >
                Request Quote
              </Link>
            </div>
          </div>
        ))}
      </div>

      {tailors.length === 0 && (
        <div className="message info">No tailors found</div>
      )}
    </div>
  );
};

export default TailorsList;
