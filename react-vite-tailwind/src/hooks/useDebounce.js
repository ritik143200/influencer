import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of the value that only updates
 * after the given delay has passed without further changes.
 *
 * @param {*} value   - The value to debounce
 * @param {number} delay - Delay in milliseconds (default 350ms)
 */
export function useDebounce(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
