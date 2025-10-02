import { useState, useEffect } from 'react';
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
            <p>Email: {tailor.email}</p>
            <p>Phone: {tailor.phone}</p>
            <p>Rating: {tailor.rating?.average || 0}/5 ({tailor.rating?.count || 0} reviews)</p>
            {tailor.specialties && tailor.specialties.length > 0 && (
              <p>Specialties: {tailor.specialties.join(', ')}</p>
            )}
            <p>Available: {tailor.isAvailable ? 'Yes' : 'No'}</p>
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
