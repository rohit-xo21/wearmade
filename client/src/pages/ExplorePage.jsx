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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6 tracking-tight">
            Explore Artistry
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
            Discover exceptional craftsmanship from our curated network of master tailors
          </p>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-900 border-t-transparent"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {portfolioItems.map(item => (
                  <div key={item._id} className="group cursor-pointer">
                    {/* Image */}
                    <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden mb-6">
                      {item.images && item.images.length > 0 ? (
                        <img 
                          src={item.images[0].url} 
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                      {item.images && item.images.length > 1 && (
                        <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                          +{item.images.length - 1} more
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-medium text-gray-900">{item.title}</h3>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="uppercase tracking-wide">{item.category}</span>
                        <span>{item.timeToComplete} days</span>
                      </div>
                      
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{item.tailor?.name}</p>
                          {item.tailor?.shopName && (
                            <p className="text-sm text-gray-500">{item.tailor.shopName}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ${item.priceRange?.min} - ${item.priceRange?.max}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{item.views || 0} views</span>
                            <span>{item.likes?.length || 0} likes</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="pt-4">
                        <Link 
                          to={`/tailor/${item.tailor._id}/portfolio`} 
                          className="block text-center border border-gray-300 text-gray-700 py-3 px-4 rounded-full text-sm font-medium hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                          View Portfolio
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {portfolioItems.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Portfolio Items Found</h3>
                  <p className="text-gray-600">Check back soon for new additions to our collection</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default ExplorePage;