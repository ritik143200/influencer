import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

const RecentActivity = ({ API_BASE_URL, getThemeColor }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState({});

  // Fetch recent activities
  const fetchActivities = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }
      
      const queryParams = new URLSearchParams({
        page: reset ? 1 : page,
        limit: 20,
        ...(filter !== 'all' && { type: filter })
      });
      
      const res = await fetch(`${API_BASE_URL}/api/activity?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
      });
      
      const data = await res.json();
      
      // Better error handling
      if (!res.ok) {
        console.error('API Error:', res.status, data);
        if (res.status === 401) {
          setError('Authentication failed. Please login again.');
        } else if (res.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          setError(`Server error: ${data.message || 'Unknown error'}`);
        }
        return;
      }
      
      if (!data?.success) {
        console.error('API Success Error:', data);
        setError(data.message || 'Failed to load activities');
        return;
      }
      
      if (reset) {
        setActivities(data.data.activities || []);
      } else {
        setActivities(prev => [...prev, ...(data.data.activities || [])]);
      }
      
      setHasMore(data.data.pagination?.current < data.data.pagination?.pages);
      setUnreadCount(data.data.unreadCount || 0);
      setStats(data.data.stats || {});
      
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load recent activities');
    } finally {
      setLoading(false);
    }
  };

  // Load more activities
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  // Mark activities as read
  const markAsRead = async (activityIds = null) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/activity/mark-read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ activityIds })
      });
      
      if (res.ok) {
        setUnreadCount(0);
        // Update local state
        if (activityIds) {
          setActivities(prev => prev.map(activity => 
            activityIds.includes(activity._id) 
              ? { ...activity, isRead: true }
              : activity
          ));
        } else {
          setActivities(prev => prev.map(activity => ({ ...activity, isRead: true })));
        }
      }
    } catch (err) {
      console.error('Error marking activities as read:', err);
    }
  };

  // Get activity icon based on type
  const getActivityIcon = (type) => {
    const icons = {
      user_registration: (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      influencer_registration: (
        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      inquiry_submission: (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      inquiry_status_update: (
        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      influencer_status_update: (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    };
    
    return icons[type] || icons.inquiry_submission;
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.medium;
  };

  // Format activity description
  const formatDescription = (activity) => {
    const { type, description, metadata } = activity;
    
    // Add rich formatting based on type
    switch (type) {
      case 'user_registration':
        return (
          <span>
            <span className="font-medium">{metadata.name || metadata.email}</span> joined the platform
          </span>
        );
      case 'influencer_registration':
        return (
          <span>
            <span className="font-medium">{metadata.fullName || metadata.email}</span> registered as influencer
          </span>
        );
      case 'inquiry_submission':
        return (
          <span>
            New inquiry from <span className="font-medium">{metadata.name}</span>
            {metadata.category && <span className="text-gray-500"> for {metadata.category}</span>}
          </span>
        );
      case 'inquiry_status_update':
        return (
          <span>
            Inquiry status changed from <span className="font-medium">{metadata.oldStatus}</span> to{' '}
            <span className="font-medium">{metadata.newStatus}</span>
          </span>
        );
      case 'influencer_status_update':
        return (
          <span>
            Influencer status changed from{' '}
            <span className="font-medium">{metadata.oldStatus ? 'Active' : 'Inactive'}</span> to{' '}
            <span className="font-medium">{metadata.newStatus ? 'Active' : 'Inactive'}</span>
          </span>
        );
      default:
        return description;
    }
  };

  useEffect(() => {
    fetchActivities(true);
  }, [filter]);

  useEffect(() => {
    if (page > 1) {
      fetchActivities(false);
    }
  }, [page]);

  if (loading && activities.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: getThemeColor('text') }}>
            Recent Activity
          </h3>
          {unreadCount > 0 && (
            <span className="text-sm text-gray-500">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Activities</option>
            <option value="user_registration">User Registrations</option>
            <option value="influencer_registration">Influencer Registrations</option>
            <option value="inquiry_submission">New Inquiries</option>
            <option value="inquiry_status_update">Inquiry Updates</option>
            <option value="influencer_status_update">Influencer Updates</option>
          </select>
          {unreadCount > 0 && (
            <button
              onClick={() => markAsRead()}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recent activities found
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity._id}
              className={`flex items-start space-x-3 p-4 rounded-lg border transition-all ${
                !activity.isRead 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      {formatDescription(activity)}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(activity.priority)}`}>
                        {activity.priority}
                      </span>
                    </div>
                  </div>
                  
                  {!activity.isRead && (
                    <button
                      onClick={() => markAsRead([activity._id])}
                      className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-4 text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
