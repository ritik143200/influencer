import React, { useState, useEffect } from 'react';

const AdminFeaturedInfluencers = ({ API_BASE_URL, getThemeColor }) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  
  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    followers: '',
    posts: '',
    budget: '',
    bio: '',
    instagram: '',
    youtube: '',
    isActive: true,
    portfolio: []
  });
  const [imageFile, setImageFile] = useState(null);
  const [portfolioFiles, setPortfolioFiles] = useState([]);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/featured-profiles/admin`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfiles(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch profiles', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handlePortfolioChange = (e) => {
    if (e.target.files) {
      setPortfolioFiles(Array.from(e.target.files));
    }
  };

  const removeExistingPortfolioImage = (url) => {
    setFormData(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter(img => img !== url)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('userToken');
    const url = isEditing ? `${API_BASE_URL}/api/featured-profiles/${editId}` : `${API_BASE_URL}/api/featured-profiles`;
    const method = isEditing ? 'PUT' : 'POST';

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('category', formData.category);
    submitData.append('followers', formData.followers);
    submitData.append('posts', formData.posts);
    submitData.append('budget', formData.budget);
    submitData.append('bio', formData.bio);
    submitData.append('isActive', formData.isActive);
    
    const socialLinks = {};
    if (formData.instagram) socialLinks.instagram = formData.instagram;
    if (formData.youtube) socialLinks.youtube = formData.youtube;
    submitData.append('socialLinks', JSON.stringify(socialLinks));

    if (imageFile) {
      submitData.append('image', imageFile);
    }

    portfolioFiles.forEach(file => {
      submitData.append('portfolio', file);
    });

    if (isEditing) {
      formData.portfolio.forEach(url => {
        submitData.append('existingPortfolio', url);
      });
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: `Profile ${isEditing ? 'updated' : 'added'} successfully!` });
        if (!isEditing) setCurrentPage(1); // Go to first page on new addition
        fetchProfiles();
        resetForm();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Error saving profile' });
      }
    } catch (err) {
      console.error('Error saving:', err);
      setMessage({ type: 'error', text: 'Network error while saving' });
    }
  };

  const handleEdit = (profile) => {
    setIsEditing(true);
    setEditId(profile._id);
    setFormData({
      name: profile.name || '',
      category: profile.category || '',
      followers: profile.followers || '',
      posts: profile.posts || '',
      budget: profile.budget || '',
      bio: profile.bio || '',
      instagram: profile.socialLinks?.instagram || '',
      youtube: profile.socialLinks?.youtube || '',
      isActive: profile.isActive,
      portfolio: profile.portfolio || []
    });
    setImageFile(null);
    setPortfolioFiles([]);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this featured profile?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/featured-profiles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile deleted successfully' });
        // Adjust page if current page becomes empty
        if (paginatedProfiles.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
        fetchProfiles();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setEditId(null);
    setImageFile(null);
    setPortfolioFiles([]);
    setFormData({
      name: '', category: '', followers: '', posts: '', budget: '', bio: '', instagram: '', youtube: '', isActive: true, portfolio: []
    });
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('draggedItemIndex', index);
  };

  const handleDrop = async (e, dropIndex) => {
    const draggedItemIndex = e.dataTransfer.getData('draggedItemIndex');
    if (!draggedItemIndex || draggedItemIndex === dropIndex.toString()) return;

    const newProfiles = [...profiles];
    const draggedItem = newProfiles[draggedItemIndex];
    newProfiles.splice(draggedItemIndex, 1);
    newProfiles.splice(dropIndex, 0, draggedItem);
    setProfiles(newProfiles);

    const orderedIds = newProfiles.map(p => p._id);
    try {
      await fetch(`${API_BASE_URL}/api/featured-profiles/reorder`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}` 
        },
        body: JSON.stringify({ orderedIds })
      });
      setMessage({ type: 'success', text: 'Order updated!' });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error('Error reordering', err);
    }
  };

  const totalPages = Math.ceil(profiles.length / ITEMS_PER_PAGE);
  const paginatedProfiles = profiles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading featured profiles...</div>;

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Featured Profiles Management</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#DF7AFE] text-black font-bold rounded-lg hover:bg-[#c35de2] transition"
        >
          {showForm ? 'Cancel' : '+ Add New Profile'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="mb-8 p-6 bg-[#0D0D0D] rounded-xl border border-white/10 shadow-inner">
          <h3 className="text-lg font-bold mb-4 text-white">{isEditing ? 'Edit Profile' : 'Add New Profile'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-1">Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 bg-[#121212] border border-white/10 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-[#DF7AFE] focus:border-transparent outline-none transition" placeholder="Influencer Name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-1">Category</label>
                <input type="text" name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2 bg-[#121212] border border-white/10 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-[#DF7AFE] focus:border-transparent outline-none transition" placeholder="e.g. Fashion, Tech" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-1">Followers Count</label>
                <input type="text" name="followers" value={formData.followers} onChange={handleInputChange} className="w-full px-4 py-2 bg-[#121212] border border-white/10 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-[#DF7AFE] focus:border-transparent outline-none transition" placeholder="e.g. 500K" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-1">Posts Count</label>
                <input type="text" name="posts" value={formData.posts} onChange={handleInputChange} className="w-full px-4 py-2 bg-[#121212] border border-white/10 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-[#DF7AFE] focus:border-transparent outline-none transition" placeholder="e.g. 1,200" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-1">Budget / Pricing</label>
                <input type="text" name="budget" value={formData.budget} onChange={handleInputChange} className="w-full px-4 py-2 bg-[#121212] border border-white/10 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-[#DF7AFE] focus:border-transparent outline-none transition" placeholder="e.g. ₹50,000 - ₹1,00,000" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white/70 mb-1">Bio / Short Description</label>
                <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="2" className="w-full px-4 py-2 bg-[#121212] border border-white/10 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-[#DF7AFE] focus:border-transparent outline-none transition" placeholder="Enter a short bio or description..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-1">Profile Image {isEditing ? <span className="font-normal text-white/40">(Leave empty to keep current)</span> : '*'}</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-3 py-2 bg-[#121212] border border-white/10 rounded-lg text-white file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" required={!isEditing} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-1">Instagram Link</label>
                <input type="text" name="instagram" value={formData.instagram} onChange={handleInputChange} className="w-full px-4 py-2 bg-[#121212] border border-white/10 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-[#DF7AFE] focus:border-transparent outline-none transition" placeholder="https://instagram.com/..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-1">YouTube Link</label>
                <input type="text" name="youtube" value={formData.youtube} onChange={handleInputChange} className="w-full px-4 py-2 bg-[#121212] border border-white/10 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-[#DF7AFE] focus:border-transparent outline-none transition" placeholder="https://youtube.com/..." />
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-6">
              <h4 className="text-md font-bold mb-4 text-white">Portfolio Management</h4>
              
              {isEditing && formData.portfolio.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-white/70 mb-3">Existing Portfolio Images</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {formData.portfolio.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                        <img src={url} alt={`Portfolio ${idx}`} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeExistingPortfolioImage(url)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-1">Upload New Portfolio Images (Multiple)</label>
                <input type="file" multiple accept="image/*" onChange={handlePortfolioChange} className="w-full px-3 py-2 bg-[#121212] border border-white/10 rounded-lg text-white file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" />
                <p className="text-xs text-white/40 mt-1">Select up to 10 images. Professional shots are recommended.</p>
              </div>
            </div>
            <div className="flex items-center mt-2 p-3 bg-[#121212] rounded-lg border border-white/10">
              <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-4 h-4 text-purple-600 rounded border-white/10 bg-[#121212] focus:ring-[#DF7AFE]" />
              <label htmlFor="isActive" className="ml-2 text-sm font-medium text-white/70">Profile is Active (Visible on frontend slider)</label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={resetForm} className="px-5 py-2.5 border border-white/10 text-white bg-white/5 rounded-lg hover:bg-white/10 font-medium transition">Cancel</button>
              <button type="submit" className="px-5 py-2.5 bg-[#DF7AFE] text-black font-bold rounded-lg hover:bg-[#c35de2] shadow-sm transition">Save Profile</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginatedProfiles.map((profile, index) => {
          const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
          return (
            <div 
              key={profile._id} 
              draggable 
              onDragStart={(e) => handleDragStart(e, globalIndex)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, globalIndex)}
              className={`border rounded-xl p-4 flex flex-col gap-4 cursor-move transition-all hover:shadow-md hover:border-white/20 ${!profile.isActive ? 'opacity-40 bg-[#0D0D0D] border-white/10' : 'bg-[#0D0D0D] border-white/10'}`}
            >
              <div className="flex items-center gap-4">
                <img src={profile.image || 'https://via.placeholder.com/150'} alt={profile.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/10 shadow-sm" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate" title={profile.name}>{profile.name}</h4>
                  <p className="text-xs text-white/50 truncate">{profile.category || 'No category'}</p>
                  <div className="flex items-center mt-1 gap-2">
                    <span className="text-xs font-semibold text-[#DF7AFE] bg-[#DF7AFE]/10 px-2 py-0.5 rounded-full truncate">{profile.followers} followers</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-white/70 bg-[#121212] p-2 rounded-lg border border-white/5">
                <div><span className="font-semibold text-white">Posts:</span> {profile.posts || '-'}</div>
                <div className="truncate" title={profile.budget}><span className="font-semibold text-white">Budget:</span> {profile.budget || '-'}</div>
              </div>

              <div className="flex gap-2 justify-end mt-auto pt-3 border-t border-white/10">
                <button onClick={() => handleEdit(profile)} className="flex-1 px-3 py-1.5 text-xs font-semibold text-[#DF7AFE] bg-[#DF7AFE]/10 border border-[#DF7AFE]/20 rounded-lg hover:bg-[#DF7AFE]/20 transition">Edit</button>
                <button onClick={() => handleDelete(profile._id)} className="flex-1 px-3 py-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition">Delete</button>
              </div>
            </div>
          );
        })}
        {profiles.length === 0 && !showForm && (
          <div className="col-span-full py-16 text-center text-white/50 border-2 border-dashed border-white/10 rounded-2xl bg-[#121212]">
            <svg className="mx-auto h-12 w-12 text-white/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-lg font-medium text-white">No Featured Profiles</p>
            <p className="text-sm text-white/50 mt-1">Get started by creating a new profile.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2 border-t border-white/10 pt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg font-semibold text-xs transition-all ${
                  currentPage === i + 1 
                    ? 'bg-[#DF7AFE] text-black shadow-md font-bold' 
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminFeaturedInfluencers;
