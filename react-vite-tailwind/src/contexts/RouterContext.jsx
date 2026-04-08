import React, { createContext, useContext, useState, useEffect } from 'react';

const RouterContext = createContext();

// Read initial path from URL query (?path=...) so pages can be opened directly during development
const getUrlInfo = () => {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const path = searchParams.get('path');
    
    // If ?path= is present, use it
    if (path) {
      const params = {};
      for (const [key, value] of searchParams.entries()) {
        if (key !== 'path') params[key] = value;
      }
      return { path, params };
    }

    // Otherwise, check pathname
    const pathname = window.location.pathname.replace(/^\//, '');
    if (pathname) {
      const params = {};
      for (const [key, value] of searchParams.entries()) {
        params[key] = value;
      }
      return { path: pathname, params };
    }

    return { path: 'home', params: {} };
  } catch (e) {
    return { path: 'home', params: {} };
  }
};

export const RouterProvider = ({ children }) => {
  const initialInfo = getUrlInfo();
  const [currentPath, setCurrentPath] = useState(initialInfo.path);
  const [params, setParams] = useState(initialInfo.params);

  const navigate = (path, navParams = {}) => {
    setCurrentPath(path);
    setParams(navParams);
    try {
      const url = new URL(window.location.href);
      url.pathname = '/'; // Keep it simple and use query params for navigation within the app
      url.search = '';
      url.searchParams.set('path', path);
      Object.keys(navParams).forEach(key => {
        url.searchParams.set(key, navParams[key]);
      });
      window.history.pushState({}, '', url.toString());
    } catch (e) {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  useEffect(() => {
    const onPop = () => {
      const info = getUrlInfo();
      setCurrentPath(info.path);
      setParams(info.params);
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
