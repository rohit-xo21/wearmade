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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-gray-900 mb-2">My Portfolio</h1>
            <p className="text-gray-600">Showcase your craftsmanship and attract new clients</p>
          </div>
          
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            {showForm ? 'Cancel' : 'Add New Work'}
          </button>
        </div>

        {/* Add Portfolio Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h3 className="text-2xl font-light text-gray-900 mb-6">Add New Portfolio Item</h3>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    placeholder="Enter work title"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
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
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                  placeholder="Describe your work..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g. formal, wedding, custom"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="materials" className="block text-sm font-medium text-gray-700 mb-2">
                    Materials (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="materials"
                    name="materials"
                    value={formData.materials}
                    onChange={handleChange}
                    placeholder="e.g. Silk, Cotton, Wool"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="timeToComplete" className="block text-sm font-medium text-gray-700 mb-2">
                    Time to Complete (days)
                  </label>
                  <input
                    type="number"
                    id="timeToComplete"
                    name="timeToComplete"
                    value={formData.timeToComplete}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="clientType" className="block text-sm font-medium text-gray-700 mb-2">
                    Client Type
                  </label>
                  <select
                    id="clientType"
                    name="clientType"
                    value={formData.clientType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images (Required - at least 1)
                </label>
                <input
                  type="file"
                  name="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                />
                <p className="text-sm text-gray-500 mt-2">Select images of your work (JPEG, PNG, WebP supported)</p>
                {selectedImages.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Selected images: {selectedImages.length}</p>
                    <div className="space-y-1">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          {image.name} ({Math.round(image.size / 1024)}KB)
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range ($)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="min"
                    placeholder="Min Price"
                    value={formData.priceRange.min}
                    onChange={(e) => handleChange(e, 'priceRange')}
                    min="0"
                    step="0.01"
                    required
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
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
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                  />
                </div>
                {formData.priceRange.min && formData.priceRange.max && 
                 parseFloat(formData.priceRange.max) <= parseFloat(formData.priceRange.min) && (
                  <p className="text-sm text-red-600 mt-2">
                    Maximum price must be greater than minimum price
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Adding...' : 'Add Portfolio Item'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Portfolio Items Grid */}
        {portfolioItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolioItems.map(item => (
              <div key={item._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                  {item.images && item.images.length > 0 ? (
                    <>
                      <img 
                        src={item.images[0].url} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {item.images.length > 1 && (
                        <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                          +{item.images.length - 1} more
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  
                  {/* Delete Button Overlay */}
                  <button 
                    onClick={() => deleteItem(item._id)}
                    className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-medium text-gray-900 mb-3">{item.title}</h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {item.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Category</span>
                      <span className="font-medium capitalize">{item.category}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Price Range</span>
                      <span className="font-medium">${item.priceRange?.min} - ${item.priceRange?.max}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Time to Complete</span>
                      <span className="font-medium">{item.timeToComplete} days</span>
                    </div>
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="pt-2">
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{item.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{item.views || 0} views</span>
                        <span>{item.likes?.length || 0} likes</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {portfolioItems.length === 0 && !showForm && (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No portfolio items yet</h3>
            <p className="text-gray-600 mb-6">Add your first work to showcase your skills!</p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Add Your First Work
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
