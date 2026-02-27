import React, { useState, useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';

const AdminDashboard = ({ config }) => {
  const { navigate } = useRouter();
  const [adminData, setAdminData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [artists, setArtists] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [revenue, setRevenue] = useState({
    total: 0,
    thisMonth: 0,
    lastMonth: 0
  });

  useEffect(() => {
    // Load admin data from localStorage
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      setAdminData(JSON.parse(storedUser));
    }
    
    // Load mock data
    setUsers([
      { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', role: 'user', joinDate: '2024-01-15', status: 'active' },
      { id: 2, name: 'Priya Patel', email: 'priya@example.com', role: 'user', joinDate: '2024-02-20', status: 'active' },
      { id: 3, name: 'Amit Kumar', email: 'amit@example.com', role: 'artist', joinDate: '2024-01-10', status: 'pending' }
    ]);

    setArtists([
      { id: 1, name: 'Melody Band', category: 'Bands', rating: 4.8, bookings: 25, status: 'verified', earnings: 125000 },
      { id: 2, name: 'DJ Storm', category: 'DJs', rating: 4.9, bookings: 18, status: 'verified', earnings: 95000 },
      { id: 3, name: 'Sara Singh', category: 'Singers', rating: 4.7, bookings: 12, status: 'pending', earnings: 68000 }
    ]);

    setBookings([
      { id: 1, user: 'Rahul Sharma', artist: 'Melody Band', date: '2024-03-15', amount: 25000, status: 'completed' },
      { id: 2, user: 'Priya Patel', artist: 'DJ Storm', date: '2024-04-20', amount: 15000, status: 'confirmed' },
      { id: 3, user: 'Amit Kumar', artist: 'Sara Singh', date: '2024-02-28', amount: 20000, status: 'pending' }
    ]);

    setRevenue({
      total: 2880000,
      thisMonth: 350000,
      lastMonth: 280000
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    navigate('home');
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-800">₹{(revenue.total / 1000000).toFixed(1)}M</span>
        </div>
        <h3 className="text-gray-600 text-sm font-medium">Total Revenue</h3>
        <p className="text-xs text-green-600 mt-2">+25% from last month</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-800">{users.length + artists.length}</span>
        </div>
        <h3 className="text-gray-600 text-sm font-medium">Total Users</h3>
        <p className="text-xs text-green-600 mt-2">+12% from last month</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-800">{bookings.length}</span>
        </div>
        <h3 className="text-gray-600 text-sm font-medium">Total Bookings</h3>
        <p className="text-xs text-green-600 mt-2">+8% from last month</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-800">{artists.length}</span>
        </div>
        <h3 className="text-gray-600 text-sm font-medium">Active Artists</h3>
        <p className="text-xs text-green-600 mt-2">+15% from last month</p>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">User Management</h3>
        <button className="px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors font-medium">
          Add User
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-brand-600">{user.name.charAt(0)}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : user.role === 'artist'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{user.joinDate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-brand-600 hover:text-brand-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderArtists = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Artist Management</h3>
        <button className="px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors font-medium">
          Approve Artists
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {artists.map((artist) => (
              <tr key={artist.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{artist.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{artist.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm text-gray-600">{artist.rating}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{artist.bookings}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">₹{artist.earnings.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    artist.status === 'verified' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {artist.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-brand-600 hover:text-brand-900 mr-3">View</button>
                  {artist.status === 'pending' && (
                    <button className="text-green-600 hover:text-green-900 mr-3">Approve</button>
                  )}
                  <button className="text-red-600 hover:text-red-900">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-800">Booking Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{booking.user}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{booking.artist}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{booking.date}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">₹{booking.amount.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    booking.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : booking.status === 'confirmed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-brand-600 hover:text-brand-900 mr-3">View</button>
                  <button className="text-red-600 hover:text-red-900">Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-full" style={{ backgroundColor: config.background_color }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                  <p className="text-sm text-gray-600">Welcome back, {adminData?.name || 'Admin'}!</p>
                  <p className="text-xs text-brand-500 mt-1">Indori Artist Platform</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4 4m4-4H3m2 4h6M5 12H3m2 4h6m6 4h6m2 4h6a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['overview', 'users', 'artists', 'bookings', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'artists' && renderArtists()}
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">System Settings</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div>
                  <h4 className="text-lg font-medium text-gray-800">User Registration</h4>
                  <p className="text-sm text-gray-600">Allow new users to register</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-brand-500 transition-colors">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div>
                  <h4 className="text-lg font-medium text-gray-800">Artist Verification</h4>
                  <p className="text-sm text-gray-600">Require manual verification for new artists</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-brand-500 transition-colors">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div>
                  <h4 className="text-lg font-medium text-gray-800">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Send system notifications to users</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
              </div>
              <div className="pt-4">
                <button className="px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors font-medium mr-4">
                  Save Settings
                </button>
                <button className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium">
                  Clear Cache
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
