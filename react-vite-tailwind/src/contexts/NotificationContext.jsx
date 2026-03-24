import { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Add a new notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Auto-remove notification after 5 seconds for non-important ones
    if (notification.type !== 'inquiry_update' && notification.type !== 'inquiry_assigned') {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }
  };

  // Remove a notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Inquiry-specific notification helpers
  const notifyInquiryUpdate = (inquiry, status, message) => {
    addNotification({
      type: 'inquiry_update',
      title: 'Inquiry Status Updated',
      message,
      inquiryId: inquiry._id,
      status,
      priority: 'medium'
    });
  };

  const notifyInquiryAssigned = (inquiry, artistName) => {
    addNotification({
      type: 'inquiry_assigned',
      title: 'Inquiry Assigned',
      message: `Your inquiry has been assigned to ${artistName}`,
      inquiryId: inquiry._id,
      priority: 'high'
    });
  };

  const notifyInquiryResponse = (inquiry, response) => {
    addNotification({
      type: 'inquiry_response',
      title: 'Artist Response',
      message: `Artist has ${response} your inquiry`,
      inquiryId: inquiry._id,
      priority: 'high'
    });
  };

  // Load notifications from localStorage on mount
  useEffect(() => {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      try {
        const parsed = JSON.parse(storedNotifications);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.isRead).length);
      } catch (error) {
        console.error('Error parsing stored notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    notifyInquiryUpdate,
    notifyInquiryAssigned,
    notifyInquiryResponse
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
