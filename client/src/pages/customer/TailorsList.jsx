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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2">Browse Tailors</h1>
        <p className="text-gray-600">Find the perfect tailor for your custom clothing needs</p>
      </div>
      
      {tailors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tailors.map(tailor => (
            <div key={tailor._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                {tailor.avatar ? (
                  <img 
                    src={tailor.avatar} 
                    alt={tailor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-xl font-medium">
                      {tailor.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-medium text-gray-900">{tailor.name}</h3>
                  {tailor.shopName && (
                    <p className="text-gray-600">{tailor.shopName}</p>
                  )}
                </div>
              </div>
              
              {/* Details */}
              <div className="space-y-3 mb-6">
                {tailor.experience && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Experience</span>
                    <span className="text-gray-900">{tailor.experience} years</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Availability</span>
                  <span className={`${tailor.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {tailor.isAvailable ? 'Available' : 'Busy'}
                  </span>
                </div>
                {tailor.specialties && tailor.specialties.length > 0 && (
                  <div>
                    <span className="text-gray-500 block mb-2">Specialties</span>
                    <div className="flex flex-wrap gap-2">
                      {tailor.specialties.slice(0, 3).map((specialty, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                          {specialty}
                        </span>
                      ))}
                      {tailor.specialties.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                          +{tailor.specialties.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Rating */}
              {tailor.rating?.average > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star}
                        className={`text-lg ${star <= Math.floor(tailor.rating.average) ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">
                    {tailor.rating.average}/5 ({tailor.rating.count} reviews)
                  </span>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-3">
                <Link 
                  to={`/tailor/${tailor._id}/portfolio`}
                  className="flex-1 text-center bg-gray-100 text-gray-700 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  View Portfolio
                </Link>
                <Link 
                  to={`/customer/new-order?tailorId=${tailor._id}`}
                  className="flex-1 text-center bg-gray-900 text-white py-3 rounded-full font-medium hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Request Quote
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No tailors found</h3>
          <p className="text-gray-600">Please check back later for available tailors</p>
        </div>
      )}
    </div>
  );
};

export default TailorsList;
