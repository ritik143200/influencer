import { useEffect } from 'react';

export const useClickOutside = (ref, onOutsideClick, active = true) => {
  useEffect(() => {
    if (!active) return undefined;

    const handlePointerDown = (event) => {
      if (ref.current && ref.current.contains(event.target)) return;
      onOutsideClick(event);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [active, onOutsideClick, ref]);
};
