import React, { useState } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';

const ContactPage = ({ config }) => {
  const { navigate } = useRouter();
  const { isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Check if user is authenticated - redirect to registration if not
    if (!isAuthenticated) {
      navigate('registration', { type: 'user' });
      return;
    }

    setIsSubmitting(true);

    try {
      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
      const token = localStorage.getItem('userToken');

      if (!token) {
        setError('Authentication token is missing. Please sign in again.');
        setIsSubmitting(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to submit contact form');
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
      
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      console.error('Error submitting contact:', err);
      setError('Network error while submitting contact form');
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Email',
      value: 'contact@indoriinfluencer.com',
    
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      label: 'Contact No.',
      value: '+91 98765 43210',
      subtext: 'Mon–Sat, 10 AM – 7 PM',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Address',
      value: 'Indore, Madhya Pradesh',
      subtext: '452001, India',
      gradient: 'from-emerald-500 to-teal-500'
    }
  ];

  return (
    <>
      <div className="pt-20 pb-12 min-h-full" style={{ backgroundColor: config.background_color }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-10 animate-fadeIn">
            <h1 className="text-3xl lg:text-4xl font-bold mb-3" style={{ color: config.text_color }}>
              Contact Us
            </h1>
            <p className="text-base text-gray-500 max-w-2xl mx-auto">
              Have a question or an idea? Reach out and let's create something amazing together.
            </p>
          </div>
         

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            
            {/* Left Column: Contact Details */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: config.text_color }}>Contact Details</h2>
                <p className="text-gray-500 text-sm">
                  Get in touch with us through any of these channels.
                </p>
                <div className="h-1 w-12 bg-brand-500 mt-4 rounded-full"></div>
              </div>

              {/* Contact Info Items */}
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-5 p-5 bg-white border border-gray-100 rounded-3xl hover:border-brand-200 transition-all duration-300 shadow-xl"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-brand-500 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</h3>
                      <p className="text-base font-semibold text-gray-800 truncate">{item.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.subtext}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="pt-4">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Follow Indori Influencer</h3>
                <div className="flex gap-3">
                  {[
                    { 
                      name: 'Instagram', 
                      icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      ),
                      bg: 'hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7]',
                      iconColor: 'text-[#E4405F]',
                      hoverText: 'hover:text-white'
                    },
                    { 
                      name: 'YouTube', 
                      icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505a3.017 3.017 0 0 0-2.122 2.136C0 8.055 0 12 0 12s0 3.945.501 5.814a3.017 3.017 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.945 24 12 24 12s0-3.945-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      ),
                      bg: 'hover:bg-[#FF0000]',
                      iconColor: 'text-[#FF0000]',
                      hoverText: 'hover:text-white'
                    },
                    { 
                      name: 'LinkedIn', 
                      icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      ),
                      bg: 'hover:bg-[#0077B5]',
                      iconColor: 'text-[#0077B5]',
                      hoverText: 'hover:text-white'
                    },
                    { 
                      name: 'Twitter', 
                      icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      ),
                      bg: 'hover:bg-black',
                      iconColor: 'text-gray-800',
                      hoverText: 'hover:text-white'
                    },
                  ].map((s, i) => (
                    <a
                      key={i}
                      href="#"
                      className={`w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center ${s.iconColor} ${s.bg} ${s.hoverText} transition-all duration-300 shadow-sm hover:shadow-md hover:border-transparent`}
                      title={s.name}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-gray-50">
                  <h2 className="text-2xl font-bold mb-1" style={{ color: config.text_color }}>Message Us</h2>
                  <p className="text-gray-500 text-sm">
                    We'll get back to you as soon as possible.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                  {/* Error Notification */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-fadeIn">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-red-800 text-sm">Error</p>
                        <p className="text-xs text-red-600">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Success Notification */}
                  {submitted && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 animate-fadeIn">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-green-800 text-sm">Thank You!</p>
                        <p className="text-xs text-green-600">Your message has been sent successfully.</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Your Name / Brand Name <span className="text-brand-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. John Doe"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 outline-none transition-all duration-200 text-gray-800 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Phone Number <span className="text-brand-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="e.g. +91 XXXXX XXXXX"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 outline-none transition-all duration-200 text-gray-800 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Email Address <span className="text-brand-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="e.g. john@example.com"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 outline-none transition-all duration-200 text-gray-800 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Subject <span className="text-brand-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="How can we help?"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 outline-none transition-all duration-200 text-gray-800 text-sm"
                      />
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Message <span className="text-brand-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Share your details with us..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 outline-none transition-all duration-200 text-gray-800 resize-none text-sm"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
};

export default ContactPage;
