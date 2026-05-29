import React, { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../data/config';

const LocationSelectInput = ({
  value,
  onChange,
  className,
  placeholder = 'Enter your city',
  inputRef,
  onSelect,
  ...props
}) => {
  const localInputRef = useRef(null);
  const timerRef = useRef(null);
  const wrapperRef = useRef(null);
  const resolvedInputRef = inputRef || localInputRef;
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchSuggestions = (query) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query.trim()) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cities?q=${encodeURIComponent(query.trim())}`);
        const data = await response.json();
        const names = data?.success && Array.isArray(data.data)
          ? data.data.map((item) => item.name || [item.city, item.state, item.country].filter(Boolean).join(', ')).filter(Boolean)
          : [];
        setSuggestions(names);
        setOpen(names.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  const handleChange = (event) => {
    const nextValue = event.target.value;
    onChange(nextValue);
    fetchSuggestions(nextValue);
  };

  const handleSelect = (location) => {
    onChange(location);
    onSelect?.(location);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={resolvedInputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => {
          if (suggestions.length) setOpen(true);
        }}
        className={className}
        placeholder={placeholder}
        autoComplete="off"
        {...props}
      />

      {(loading || open) && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-60 overflow-auto rounded-2xl border border-[#3E2A55] bg-[#0D0D0D] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          {loading ? (
            <div className="px-3 py-2 text-sm font-semibold text-white/62">Searching locations...</div>
          ) : (
            suggestions.map((location) => (
              <button
                key={location}
                type="button"
                onClick={() => handleSelect(location)}
                className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-white transition hover:bg-[#171321]"
              >
                {location}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSelectInput;
