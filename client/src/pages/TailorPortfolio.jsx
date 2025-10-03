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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  if (!tailor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-2">Tailor not found</h2>
          <p className="text-gray-600">The tailor you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-gray-900 mb-2">{tailor.name}</h1>
            <p className="text-xl text-gray-600">{tailor.shopName || 'Professional Tailor'}</p>
          </div>
          <Link 
            to="/customer/tailors" 
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors"
          >
            ← Back to Tailors
          </Link>
        </div>
      </div>
      
      {/* Profile Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="flex items-center gap-6 mb-8">
          {tailor.avatar && (
            <img 
              src={tailor.avatar} 
              alt={tailor.name}
              className="w-20 h-20 rounded-full object-cover"
            />
          )}
          <div>
            <h2 className="text-2xl font-medium text-gray-900 mb-1">{tailor.name}</h2>
            {tailor.shopName && <p className="text-lg text-gray-600 mb-2">{tailor.shopName}</p>}
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {tailor.rating?.average > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span>{tailor.rating.average}/5 ({tailor.rating.count || 0} reviews)</span>
                </div>
              )}
              <span>{tailor.experience || 0} years experience</span>
            </div>
            
            {tailor.specialties && tailor.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tailor.specialties.map((specialty, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {specialty}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tailor.shopAddress && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Location</h4>
              <p className="text-gray-600">
                {tailor.shopAddress.street && `${tailor.shopAddress.street}, `}
                {tailor.shopAddress.city && `${tailor.shopAddress.city}, `}
                {tailor.shopAddress.state && `${tailor.shopAddress.state}, `}
                {tailor.shopAddress.country}
              </p>
            </div>
          )}

          {tailor.priceRange && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Price Range</h4>
              <p className="text-gray-600">${tailor.priceRange.min} - ${tailor.priceRange.max}</p>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-8">
          <Link 
            to={`/customer/new-order?tailorId=${id}`} 
            className="bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Request Quote
          </Link>
        </div>
      </div>

      {/* Portfolio Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-medium text-gray-900 mb-6">
          Portfolio ({portfolioItems.length} items)
        </h2>
        
        {portfolioItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.map(item => (
              <div key={item._id} className="bg-gray-50 rounded-xl overflow-hidden">
                {/* Display first image as thumbnail */}
                {item.images && item.images.length > 0 && (
                  <div className="aspect-square bg-gray-200 relative">
                    <img 
                      src={item.images[0].url || item.images[0]} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {item.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                        +{item.images.length - 1} more
                      </div>
                    )}
                  </div>
                )}
                
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div><span className="font-medium">Category:</span> {item.category}</div>
                    {item.priceRange && (
                      <div><span className="font-medium">Price:</span> ${item.priceRange.min} - ${item.priceRange.max}</div>
                    )}
                    {item.timeToComplete && (
                      <div><span className="font-medium">Time:</span> {item.timeToComplete} days</div>
                    )}
                  </div>
                  
                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>{item.views || 0} views</span>
                      <span>{item.likes?.length || 0} likes</span>
                    </div>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No portfolio items</h3>
            <p className="text-gray-600">This tailor hasn't added any work to their portfolio yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TailorPortfolio;
