import React, { useState, useEffect, useCallback } from 'react';

/**
 * Lightweight in-page toast notification — replaces all alert() calls.
 *
 * Usage:
 *   const { showToast, ToastContainer } = useToast();
 *   showToast('Saved!', 'success');
 *   <ToastContainer />
 */

let _globalShowToast = null;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  useEffect(() => {
    _globalShowToast = showToast;
    return () => { _globalShowToast = null; };
  }, [showToast]);

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  };

  const colorMap = {
    success: 'bg-green-500',
    error:   'bg-red-500',
    info:    'bg-blue-500',
    warning: 'bg-amber-500',
  };

  const ToastContainer = () => (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white shadow-2xl
            pointer-events-auto min-w-[260px] max-w-sm text-sm font-medium
            animate-[slideUp_0.3s_ease-out] ${colorMap[t.type] ?? colorMap.info}`}
          style={{ animation: 'slideUp 0.3s ease-out' }}
        >
          <span className="flex-shrink-0">{icons[t.type]}</span>
          <span className="flex-1">{t.message}</span>
        </div>
      ))}
    </div>
  );

  return { showToast, ToastContainer };
}

/** Call from anywhere (service layer etc.) without needing the hook */
export const showGlobalToast = (message, type = 'info') => {
  if (_globalShowToast) _globalShowToast(message, type);
};
