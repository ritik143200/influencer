import React, { useState, useEffect } from 'react';

const AdminFeaturedInfluencers = ({ influencers, API_BASE_URL, getThemeColor }) => {
  const [featured, setFeatured] = useState([]);
  const [available, setAvailable] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  
  // For drag and drop
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  useEffect(() => {
    // Sort featured by their featuredOrder, fallback to index if missing
    const currentFeatured = influencers
      .filter(inf => inf.trending)
      .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));
      
    const currentAvailable = influencers.filter(inf => !inf.trending);
    
    setFeatured(currentFeatured);
    setAvailable(currentAvailable);
  }, [influencers]);

  const handleAddFeatured = (influencer) => {
    setFeatured(prev => [...prev, influencer]);
    setAvailable(prev => prev.filter(inf => inf._id !== influencer._id && inf.id !== influencer.id));
  };

  const handleRemoveFeatured = (influencer, index) => {
    setFeatured(prev => prev.filter((_, i) => i !== index));
    setAvailable(prev => [influencer, ...prev]);
  };

  // Drag and Drop Handlers
  const onDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Small timeout to allow drag image to be captured before we maybe change opacity
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const onDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItemIndex(null);
  };

  const onDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    
    // Reorder array
    const newFeatured = [...featured];
    const draggedItem = newFeatured[draggedItemIndex];
    newFeatured.splice(draggedItemIndex, 1);
    newFeatured.splice(index, 0, draggedItem);
    
    setDraggedItemIndex(index);
    setFeatured(newFeatured);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const featuredIds = featured.map(inf => inf._id || inf.id);
      
      const res = await fetch(`${API_BASE_URL}/api/admin/featured-influencers`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ featuredIds })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Featured profiles updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save changes' });
      }
    } catch (error) {
      console.error('Error saving featured profiles:', error);
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const filteredAvailable = available.filter(inf => {
    const searchStr = `${inf.firstName} ${inf.lastName} ${inf.category} ${inf.username}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Featured Profiles Management</h2>
          <p className="text-sm text-gray-500">Select and reorder influencers that appear on the Home Page slider.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className={`px-6 py-2.5 rounded-xl text-white font-medium transition-all ${isSaving ? 'opacity-70' : 'hover:scale-105 shadow-md'}`}
          style={{ backgroundColor: getThemeColor('primary') }}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Selected Featured List */}
        <div>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 h-full">
            <h3 className="font-semibold text-gray-800 mb-4 flex justify-between items-center">
              <span>Selected for Home Page</span>
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{featured.length} selected</span>
            </h3>
            
            <p className="text-xs text-gray-500 mb-4 pb-2 border-b border-gray-200">Drag and drop to reorder. The top influencer will appear first in the slider.</p>
            
            <div className="space-y-3">
              {featured.length === 0 ? (
                <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  No featured profiles selected.
                </div>
              ) : (
                featured.map((inf, index) => (
                  <div 
                    key={inf._id || inf.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, index)}
                    onDragEnd={onDragEnd}
                    onDragOver={(e) => onDragOver(e, index)}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400 cursor-grab px-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                        {inf.profileImage ? (
                          <img src={inf.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500 bg-gray-200">
                            {inf.firstName?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{inf.firstName} {inf.lastName}</p>
                        <p className="text-xs text-gray-500">{inf.category || inf.InfluencerType || 'Influencer'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveFeatured(inf, index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from featured"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Available Influencers */}
        <div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 h-full shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Available Influencers</h3>
            
            <div className="relative mb-4">
              <input 
                type="text" 
                placeholder="Search by name or category..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ focusRing: getThemeColor('primary') }}
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {filteredAvailable.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No available influencers found.
                </div>
              ) : (
                filteredAvailable.map(inf => (
                  <div key={inf._id || inf.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                        {inf.profileImage ? (
                          <img src={inf.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500 bg-gray-200">
                            {inf.firstName?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{inf.firstName} {inf.lastName}</p>
                        <p className="text-xs text-gray-500">{inf.category || inf.InfluencerType || 'Influencer'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddFeatured(inf)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFeaturedInfluencers;
