import React from 'react';

const AuthButton = ({ 
  text,
  children, 
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        w-full py-3 px-6 font-semibold text-white
        bg-gradient-to-r from-brand-500 to-brand-600
        rounded-xl transition-all duration-300 ease-out
        hover:shadow-lg hover:shadow-brand-500/30
        hover:scale-[1.02] active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:scale-100 disabled:hover:shadow-none
        relative overflow-hidden
        ${className}
      `}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
        {children || text}
      </span>
    </button>
  );
};

export default AuthButton;
