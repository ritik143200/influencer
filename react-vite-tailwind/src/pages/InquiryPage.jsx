import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../contexts/RouterContext';

const InquiryPage = ({ config }) => {
  const { user, isAuthenticated } = useAuth();
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');

  const getThemeColor = (key) => {
    if (!config) return undefined;
    return config[key];
  };

  const initialForm = useMemo(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    hiringFor: 'influencer',
    category: '',
    location: '',
    budget: '',
    requirements: ''
  }), [user]);

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { navigate } = useRouter();

  // Category suggestions for each hiring type
  // Keys must match dropdown values exactly (including spaces)
  const categoryOptions = {
    'influencer': [
      'Lifestyle',
      'UGC Creator',
      'Fashion',
      'Fitness',
      'Travel',
      'Food',
      'Tech',
      'Finance',
      'Gaming',
      'Education',
      'Motivation',
      'Spiritual',
      'Actor',
      'Comedian',
      'Model',
      'Filmmaker',
      'Historical',
      'Other'
    ],
    celebrity: [
      'Finance & Investment',
      'Stock Market Analysis',
      'Travel',
      'Lifestyle',
      'Fitness & Health',
      'Yoga & Meditation',
      'Motivation & Self Help',
      'Study & Productivity',
      'Career Guidance',
      'Cooking',
      'Street Food Vlogs',
      'Kids Learning (Rhymes, ABC, Stories)',
      'Technology (Unboxing)',
      'App Review',
      'Gadgets Review',
      'Gaming',
      'Comedy',
      'Roasting',
      'Street Interview',
      'Personal Branding / Self Growth',
      'Education',
      'AI',
      'Art & Craft',
      'Historical',
      'Spiritual',
      'Fashion',
      'Vlogs',
      'Astrology',
      'Other'
    ],
    'city page': [
      'Food Pages',
      'Local City Pages',
      'State Pages'
    ],
    'meme page': [
      'Meme Pages',
      'Music Pages',
      'Celebrity Pages',
      'Motivation Pages',
      'Devotional Pages',
      'Media Pages',
      'Political Pages',
      'Other'
    ]
  };






  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);



  const onChange = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const updates = { [key]: value };
      if (key === 'hiringFor') {
        updates.category = '';
      }
      return { ...prev, ...updates };
    });
  };





  const validate = () => {
    if (!form.name || !form.email || !form.phone) return 'Please fill your contact details.';
    if (!form.hiringFor) return 'Please select who you want to hire.';
    if (!form.category) return 'Please enter a category.';
    if (!form.location) return 'Please enter a location.';

    if (form.budget === '' || form.budget === null || form.budget === undefined) return 'Please enter a budget.';
    const budgetNumber = Number(form.budget);
    if (Number.isNaN(budgetNumber) || budgetNumber < 0) return 'Budget must be a valid number.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isAuthenticated) {
      localStorage.setItem('pendingInquiry', JSON.stringify(form));
      setShowLoginModal(true);
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const token = localStorage.getItem('userToken');
    if (!token) {
      setError('Your session token is missing. Please sign in again.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          hiringFor: form.hiringFor,
          category: form.category,
          location: form.location,

          budget: Number(form.budget),
          requirements: form.requirements
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to submit inquiry.');
        return;
      }

      setSuccess('Inquiry submitted successfully! Our admin will review it shortly.');
      setForm((prev) => ({
        ...prev,
        hiringFor: 'influencer',
        category: '',
        location: '',

        budget: '',
        requirements: ''
      }));
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      setError('Network error while submitting inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 lg:pt-24" style={{ backgroundColor: getThemeColor('background_color') }}>
      <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0 py-0">
        <div className="w-full" style={{ backgroundColor: getThemeColor('surface') || 'transparent' }}>
          <div
            className="w-full px-6 sm:px-8 py-10 bg-gradient-to-br rounded-b-[3rem] shadow-lg"
            style={{
              backgroundImage: `linear-gradient(135deg, ${getThemeColor('primary') || '#ee7711'} 0%, ${getThemeColor('secondary') || '#f19332'} 100%)`
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 max-w-6xl mx-auto">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">Hire Influencers</h1>
                <p className="text-white/90 mt-2 max-w-xl leading-relaxed text-sm md:text-lg">
                  Connect with the best influencers for your brand campaigns.
                </p>
              </div>


            </div>
          </div>

          <div className="mt-8 px-0 sm:px-0 pb-8 relative z-10">


            {error && (
              <div className="mb-8 rounded-lg border border-red-200 bg-red-50 pl-4 pr-5 py-3 flex items-start gap-3 border-l-4 border-red-400">
                <div className="flex-shrink-0 mt-1 w-2.5 h-2.5 rounded-full bg-red-400" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Submission failed</p>
                  <p className="text-sm text-red-800 mt-1">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-8 rounded-lg border border-green-200 bg-green-50 pl-4 pr-5 py-3 flex items-start gap-3 border-l-4 border-green-400">
                <div className="flex-shrink-0 mt-1 w-2.5 h-2.5 rounded-full bg-green-400" />
                <div>
                  <p className="text-sm font-semibold text-green-900">Submitted</p>
                  <p className="text-sm text-green-800 mt-1">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition transform-gpu hover:-translate-y-0.5 border-l-4 border-brand-500">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Your Details</h2>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">So the admin can contact you quickly.</p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Full Name / Brand Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1118.88 6.196M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <input
                          value={form.name}
                          onChange={onChange('name')}
                          className="mt-0 w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                          placeholder="Your name"
                          autoComplete="name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Phone</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.6a1 1 0 01.9.55l1.2 2.4a1 1 0 01-.2 1.05L9 8.5a11 11 0 005.5 5.5l1.5-1.1a1 1 0 011.05-.2l2.4 1.2A1 1 0 0119 18.4V21a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                          </svg>
                        </div>
                        <input
                          value={form.phone}
                          onChange={onChange('phone')}
                          className="mt-0 w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                          placeholder="Phone number"
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Email</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0l-4-4m4 4l-4 4" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          value={form.email}
                          onChange={onChange('email')}
                          className="mt-0 w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                          placeholder="Email address"
                          autoComplete="email"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition transform-gpu hover:-translate-y-0.5 border-l-4 border-brand-500">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Requirement</h2>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Tell us what you want to hire.</p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Hiring Of</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <select
                          value={form.hiringFor}
                          onChange={onChange('hiringFor')}
                          className="mt-0 w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50/30 shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white appearance-none cursor-pointer transition-all duration-200 font-medium text-gray-800"
                        >
                          <option value="influencer">Hiring of Influencer</option>
                          <option value="celebrity">Hiring of Celebrity</option>
                          <option value="city page">Hiring of City Page</option>
                          <option value="meme page">Hiring of Meme Page</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 group-hover:text-gray-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Category</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h12M3 17h18" />
                          </svg>
                        </div>
                        <select
                          value={form.category}
                          onChange={onChange('category')}
                          className="mt-0 w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50/30 shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white appearance-none cursor-pointer transition-all duration-200 font-medium text-gray-800"
                        >
                          <option value="">Select Category</option>
                          {categoryOptions[form.hiringFor]?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 group-hover:text-gray-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Location</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <input
                          value={form.location}
                          onChange={onChange('location')}
                          className="mt-0 w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                          placeholder="City / Venue"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Budget (INR)</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-600">₹</span>
                        </div>
                        <input
                          value={form.budget}
                          onChange={onChange('budget')}
                          className="mt-0 w-full pl-8 pr-4 py-3 rounded-xl border border-gray-100 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all"
                          placeholder="e.g. 5000"
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition transform-gpu hover:-translate-y-0.5 border-l-4 border-brand-500">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                  <h2 className="text-lg font-semibold text-gray-900">campaigns  Details</h2>
                </div>
                <p className="text-sm text-gray-500 mt-1">Help us understand the timeline and context.</p>

                <div className="mt-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Requirements / Message</label>
                    <textarea
                      value={form.requirements}
                      onChange={onChange('requirements')}
                      rows={6}
                      className="mt-0 w-full px-4 py-4 rounded-2xl border border-gray-100 bg-white shadow-inner focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all text-gray-800"
                      placeholder="Describe the event type, event date, influencer style, duration, deliverables, audience size, etc."
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="text-sm text-gray-500">
                  By submitting, you agree that an admin may contact you using the details provided.
                </div>

                <div className="sm:flex-1 flex sm:justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-8 py-3 rounded-full font-semibold text-white shadow-2xl transition-all flex items-center gap-3 justify-center w-full sm:w-auto ${submitting ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-2xl active:scale-[0.99]'
                      }`}
                    style={{ background: `linear-gradient(90deg, ${getThemeColor('primary') || '#ee7711'} 0%, ${getThemeColor('secondary') || '#f19332'} 100%)` }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    {submitting ? 'Submitting...' : 'Submit Inquiry'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Login Requirement Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in zoom-in-95 duration-300 scale-100">
            <div className="relative p-8 sm:p-10 text-center">
              {/* Close Button */}
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
                <svg className="w-10 h-10 text-orange-500 -rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">You're almost there!</h3>
              <p className="text-gray-600 mb-8 text-base sm:text-lg leading-relaxed">
                Please sign up to complete your inquiry and track its progress in your dashboard.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => navigate('registration', { type: 'user' })}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  New User? Sign Up
                </button>
                <button
                  onClick={() => navigate('auth')}
                  className="w-full py-4 bg-white border-2 border-orange-500 text-orange-500 rounded-2xl font-bold text-lg hover:bg-orange-50 transition-all"
                >
                  Have an Account? Sign In
                </button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-full py-4 text-gray-500 font-semibold hover:text-gray-700 transition-colors"
                >
                  Continue as Guest (Draft)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryPage;
