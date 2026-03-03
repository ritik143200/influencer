import React, { createContext, useContext, useState } from 'react';

const RouterContext = createContext();

export const RouterProvider = ({ children }) => {
  const [currentPath, setCurrentPath] = useState('home');
  const [params, setParams] = useState({});

  const navigate = (path, navParams = {}) => {
    setCurrentPath(path);
    setParams(navParams);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

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
