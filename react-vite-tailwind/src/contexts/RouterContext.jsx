import React, { createContext, useContext, useState, useEffect } from 'react';

const RouterContext = createContext();

// Read initial path from URL query (?path=...) so pages can be opened directly during development
const getInitialPathFromUrl = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('path');
    return p || 'home';
  } catch (e) {
    return 'home';
  }
};

export const RouterProvider = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(getInitialPathFromUrl());
  const [params, setParams] = useState({});

  const navigate = (path, navParams = {}) => {
    setCurrentPath(path);
    setParams(navParams);
    // Update URL so direct links work (preserve other query params)
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('path', path);
      window.history.pushState({}, '', url.toString());
    } catch (e) {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // Handle browser navigation (back/forward)
  useEffect(() => {
    const onPop = () => {
      const path = getInitialPathFromUrl();
      setCurrentPath(path);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <RouterContext.Provider value={{ currentPath, params, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
