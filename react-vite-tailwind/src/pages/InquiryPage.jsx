import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

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
    eventType: '',
    eventDate: '',
    budget: '',
    requirements: ''
  }), [user]);

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const validate = () => {
    if (!form.name || !form.email || !form.phone) return 'Please fill your contact details.';
    if (!form.hiringFor) return 'Please select who you want to hire.';
    if (!form.category) return 'Please enter a category.';
    if (!form.location) return 'Please enter a location.';
    if (!form.eventType) return 'Please enter an event type.';
    if (!form.eventDate) return 'Please select an event date.';
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
      setError('Please sign in to submit an inquiry.');
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
          eventType: form.eventType,
          eventDate: form.eventDate,
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
        eventType: '',
        eventDate: '',
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
    <div className="min-h-screen pt-12" style={{ backgroundColor: getThemeColor('background_color') }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/20" style={{ backgroundColor: getThemeColor('surface') || '#ffffff' }}>
          <div
            className="px-6 sm:px-10 py-8 bg-gradient-to-br rounded-t-3xl"
            style={{
              backgroundImage: `linear-gradient(135deg, ${getThemeColor('primary') || '#ee7711'} 0%, ${getThemeColor('secondary') || '#f19332'} 100%)`
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Send a Collaboration Request</h1>
                <p className="text-white/95 mt-2 max-w-2xl leading-relaxed">
                  Send a collaboration request for an influencer. Your inquiry will be reviewed by the admin and marked as <span className="font-semibold">Pending</span> by default.
                </p>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/20">
                <p className="text-white/90 text-sm font-semibold">Status Workflow</p>
                <p className="text-white/80 text-xs mt-1">Pending → Accepted / Rejected</p>
              </div>
            </div>
          </div>

          <div className="mt-10 px-6 sm:px-10 pb-10 relative z-10">
            {!isAuthenticated && (
              <div className="mb-8 rounded-2xl border border-yellow-200 bg-yellow-50 px-5 py-4">
                <p className="text-sm font-semibold text-yellow-900">Sign in required</p>
                <p className="text-sm text-yellow-800 mt-1">Please sign in to submit an inquiry.</p>
              </div>
            )}

            {error && (
              <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                <p className="text-sm font-semibold text-red-900">Submission failed</p>
                <p className="text-sm text-red-800 mt-1">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
                <p className="text-sm font-semibold text-green-900">Submitted</p>
                <p className="text-sm text-green-800 mt-1">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl bg-white p-6 shadow-lg border border-transparent hover:shadow-2xl transition">
                  <h2 className="text-lg font-semibold text-gray-900">Your Details</h2>
                  <p className="text-sm text-gray-500 mt-1">So the admin can contact you quickly.</p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Full Name</label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1118.88 6.196M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <input
                          value={form.name}
                          onChange={onChange('name')}
                          className="mt-0 w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100"
                          placeholder="Your name"
                          autoComplete="name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone</label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.6a1 1 0 01.9.55l1.2 2.4a1 1 0 01-.2 1.05L9 8.5a11 11 0 005.5 5.5l1.5-1.1a1 1 0 011.05-.2l2.4 1.2A1 1 0 0119 18.4V21a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                          </svg>
                        </div>
                        <input
                          value={form.phone}
                          onChange={onChange('phone')}
                          className="mt-0 w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100"
                          placeholder="Phone number"
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0l-4-4m4 4l-4 4" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          value={form.email}
                          onChange={onChange('email')}
                          className="mt-0 w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100"
                          placeholder="Email address"
                          autoComplete="email"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-lg border border-transparent hover:shadow-2xl transition">
                  <h2 className="text-lg font-semibold text-gray-900">Requirement</h2>
                  <p className="text-sm text-gray-500 mt-1">Tell us what you want to hire.</p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Hiring For</label>
                      <select
                        value={form.hiringFor}
                        onChange={onChange('hiringFor')}
                        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100 appearance-none cursor-pointer"
                      >
                        <option value="influencer">Influencer</option>
                        <option value="creator">Creator</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Category</label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h12M3 17h18" />
                          </svg>
                        </div>
                        <input
                          value={form.category}
                          onChange={onChange('category')}
                          className="mt-0 w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                          placeholder="e.g. Lifestyle, Fitness, Tech"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Location</label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <input
                          value={form.location}
                          onChange={onChange('location')}
                          className="mt-0 w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                          placeholder="City / Venue"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Budget (INR)</label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-600">₹</span>
                        </div>
                        <input
                          value={form.budget}
                          onChange={onChange('budget')}
                          className="mt-0 w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                          placeholder="e.g. 5000"
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-lg border border-transparent hover:shadow-2xl transition">
                <h2 className="text-lg font-semibold text-gray-900">Event Details</h2>
                <p className="text-sm text-gray-500 mt-1">Help us understand the timeline and context.</p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Event Type</label>
                    <input
                      value={form.eventType}
                      onChange={onChange('eventType')}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100"
                      placeholder="e.g. Wedding, Brand Shoot"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Event Date</label>
                    <input
                      type="date"
                      value={form.eventDate}
                      onChange={onChange('eventDate')}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Requirements / Message</label>
                    <textarea
                      value={form.requirements}
                      onChange={onChange('requirements')}
                      rows={4}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100"
                      placeholder="Describe the influencer style, duration, deliverables, audience size, etc."
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
                    disabled={submitting || !isAuthenticated}
                    className={`px-8 py-3 rounded-full font-semibold text-white shadow-2xl transition-all flex items-center gap-3 justify-center w-full sm:w-auto ${submitting || !isAuthenticated
                      ? 'opacity-60 cursor-not-allowed'
                      : 'hover:shadow-2xl active:scale-[0.99]'
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
    </div>
  );
};

export default InquiryPage;
