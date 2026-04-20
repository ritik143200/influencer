import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const InfluencerProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInfluencer = async () => {
      try {
        setLoading(true);
        setError(null);
        const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
        const response = await fetch(`${API_BASE_URL}/api/influencer/${id}`);
        const result = await response.json();
        if (response.ok && result.success) {
          setInfluencer(result.data);
        } else {
          throw new Error(result.message || 'Influencer not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInfluencer();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  if (!influencer) return null;
  
  const renderLocation = (loc) => {
    if (!loc) return 'Not specified';
    if (typeof loc === 'string') return loc;
    const { city = '', country = '' } = loc;
    return [city, country].filter(Boolean).join(', ') || 'Not specified';
  };

  // Helper to filter portfolio items
  const filterPortfolio = (influencer, isImage = true) => {
    if (!influencer.portfolio) return [];
    return influencer.portfolio.filter(item => 
      typeof item === 'string' && 
      (isImage ? 
        (item.includes('cloudinary.com') || item.match(/\.(jpeg|jpg|gif|png|webp)$/i)) :
        !(item.includes('cloudinary.com') || item.match(/\.(jpeg|jpg|gif|png|webp)$/i))
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <img
            src={influencer.profileImage || '/default-profile.png'}
            alt={influencer.fullName}
            className="w-40 h-40 rounded-full object-cover border-4 border-blue-200 shadow-md"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{influencer.fullName}</h1>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{influencer.category}</span>
              {influencer.subcategory && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{influencer.subcategory}</span>
              )}
              {influencer.skills && influencer.skills.map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">{skill}</span>
              ))}
            </div>
            <div className="text-gray-600 mb-2">{renderLocation(influencer.location)}</div>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-lg font-semibold text-blue-700">₹{influencer.budget} / event</span>
              {influencer.rating && (
                <span className="flex items-center gap-1 text-yellow-500 font-medium">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/></svg>
                  {influencer.rating.average || influencer.rating}
                </span>
              )}
            </div>
            <div className="mb-4 text-gray-700">{influencer.bio || 'No bio available.'}</div>
            <button
              onClick={() => navigate(-1)}
              className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              Back
            </button>
          </div>
        </div>
        {/* Portfolio Section (Images Only) */}
        {filterPortfolio(influencer, true).length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Portfolio</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filterPortfolio(influencer, true).map((item, i) => (
                <img
                  key={i}
                  src={item}
                  alt={`Portfolio ${i + 1}`}
                  className="w-full h-40 object-cover rounded-lg shadow"
                />
              ))}
            </div>
          </div>
        )}

        {/* Other Links Section (Non-image links) */}
        {filterPortfolio(influencer, false).length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Other Links</h2>
            <ul className="list-disc pl-6 space-y-2">
              {filterPortfolio(influencer, false).map((item, i) => (
                <li key={i}>
                  <a href={item} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfluencerProfilePage;
