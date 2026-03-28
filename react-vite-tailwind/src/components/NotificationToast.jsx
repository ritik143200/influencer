import React, { useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react';

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotifications();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none max-w-md w-full px-4 sm:px-0">
      {notifications.map((notification) => (
        <ToastItem 
          key={notification.id} 
          notification={notification} 
          onClose={() => removeNotification(notification.id)} 
        />
      ))}
    </div>
  );
};

const ToastItem = ({ notification, onClose }) => {
  const { type, title, message, priority } = notification;

  const getIcon = () => {
    switch (type) {
      case 'inquiry_update':
      case 'inquiry_assigned':
        return <Bell className="w-5 h-5 text-brand-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    if (priority === 'high') return 'bg-red-50 border-red-200';
    return 'bg-white border-gray-200';
  };

  return (
    <div 
      className={`pointer-events-auto flex items-start gap-4 p-4 rounded-xl border shadow-lg animate-in slide-in-from-right duration-300 ${getBackgroundColor()}`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        {title && <h4 className="text-sm font-semibold text-gray-900 mb-1">{title}</h4>}
        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default NotificationToast;
