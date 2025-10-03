import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Portfolio = () => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'shirt',
    tags: '',
    materials: '',
    timeToComplete: '',
    clientType: 'unisex',
    difficulty: 'intermediate',
    priceRange: {
      min: '',
      max: ''
    }
  });

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await api.get('/portfolio');
      setPortfolioItems(response.data.data.docs || []);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, section = null) => {
    const { name, value } = e.target;
    
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (selectedImages.length === 0) {
      setError('At least one image is required');
      setSubmitting(false);
      return;
    }

    // Validate price range
    const minPrice = parseFloat(formData.priceRange.min);
    const maxPrice = parseFloat(formData.priceRange.max);
    
    if (isNaN(minPrice) || isNaN(maxPrice)) {
      setError('Please enter valid price range values');
      setSubmitting(false);
      return;
    }
    
    if (maxPrice <= minPrice) {
      setError('Maximum price must be greater than minimum price');
      setSubmitting(false);
      return;
    }

    try {
      // Create FormData for file upload
      const formDataToSubmit = new FormData();
      
      // Add form fields
      formDataToSubmit.append('title', formData.title);
      formDataToSubmit.append('description', formData.description);
      formDataToSubmit.append('category', formData.category);
      formDataToSubmit.append('tags', formData.tags);
      formDataToSubmit.append('materials', formData.materials);
      formDataToSubmit.append('timeToComplete', formData.timeToComplete);
      formDataToSubmit.append('clientType', formData.clientType);
      formDataToSubmit.append('difficulty', formData.difficulty);
      formDataToSubmit.append('priceRange[min]', formData.priceRange.min);
      formDataToSubmit.append('priceRange[max]', formData.priceRange.max);
      
      // Add image files
      selectedImages.forEach((image) => {
        formDataToSubmit.append('images', image);
      });

      const response = await api.post('/portfolio', formDataToSubmit);
      
      if (response.data.success) {
        setPortfolioItems(prev => [response.data.data, ...prev]);
        setShowForm(false);
        setSelectedImages([]);
        setFormData({
          title: '',
          description: '',
          category: 'shirt',
          tags: '',
          materials: '',
          timeToComplete: '',
          clientType: 'unisex',
          difficulty: 'intermediate',
          priceRange: { min: '', max: '' }
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create portfolio item');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this portfolio item?')) {
      try {
        await api.delete(`/portfolio/${itemId}`);
        setPortfolioItems(prev => prev.filter(item => item._id !== itemId));
      } catch (error) {
        console.error('Failed to delete portfolio item:', error);
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <h1>My Portfolio</h1>
      
      <div style={{ margin: '20px 0' }}>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Portfolio Item'}
        </button>
      </div>

      {/* Add Portfolio Form */}
      {showForm && (
        <div className="form-container">
          <h3>Add New Portfolio Item</h3>
          
          {error && (
            <div className="message error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category:</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="shirt">Shirt</option>
                <option value="pants">Pants</option>
                <option value="dress">Dress</option>
                <option value="suit">Suit</option>
                <option value="jacket">Jacket</option>
                <option value="skirt">Skirt</option>
                <option value="blouse">Blouse</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags (comma-separated):</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. formal, wedding, custom"
              />
            </div>

            <div className="form-group">
              <label htmlFor="materials">Materials (comma-separated):</label>
              <input
                type="text"
                id="materials"
                name="materials"
                value={formData.materials}
                onChange={handleChange}
                placeholder="e.g. Silk, Cotton, Wool"
              />
            </div>

            <div className="form-group">
              <label htmlFor="timeToComplete">Time to Complete (days):</label>
              <input
                type="number"
                id="timeToComplete"
                name="timeToComplete"
                value={formData.timeToComplete}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="clientType">Client Type:</label>
              <select
                id="clientType"
                name="clientType"
                value={formData.clientType}
                onChange={handleChange}
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulty Level:</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div className="form-group">
              <label>Images (Required - at least 1):</label>
              <input
                type="file"
                name="images"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                required
              />
              <small>Select images of your work (JPEG, PNG, WebP supported)</small>
              {selectedImages.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <p>Selected images: {selectedImages.length}</p>
                  {selectedImages.map((image, index) => (
                    <div key={index} style={{ fontSize: '12px' }}>
                      {image.name} ({Math.round(image.size / 1024)}KB)
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Price Range ($):</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  name="min"
                  placeholder="Min Price"
                  value={formData.priceRange.min}
                  onChange={(e) => handleChange(e, 'priceRange')}
                  min="0"
                  step="0.01"
                  required
                />
                <input
                  type="number"
                  name="max"
                  placeholder="Max Price"
                  value={formData.priceRange.max}
                  onChange={(e) => handleChange(e, 'priceRange')}
                  min={formData.priceRange.min || "0"}
                  step="0.01"
                  required
                />
              </div>
              {formData.priceRange.min && formData.priceRange.max && 
               parseFloat(formData.priceRange.max) <= parseFloat(formData.priceRange.min) && (
                <small style={{ color: 'red', fontSize: '12px' }}>
                  Maximum price must be greater than minimum price
                </small>
              )}
            </div>

            <div className="form-group">
              <button type="submit" className="btn btn-success" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Portfolio Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Portfolio Items Grid */}
      <div className="card-grid">
        {portfolioItems.map(item => (
          <div key={item._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3>{item.title}</h3>
              <button 
                className="btn btn-danger"
                onClick={() => deleteItem(item._id)}
                style={{ fontSize: '12px', padding: '4px 8px' }}
              >
                Delete
              </button>
            </div>
            
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

      {portfolioItems.length === 0 && !showForm && (
        <div className="message info">
          No portfolio items yet. Add your first work to showcase your skills!
        </div>
      )}
    </div>
  );
};

export default Portfolio;
