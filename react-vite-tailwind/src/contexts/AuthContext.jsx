import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = (userData = {}) => ({
    ...userData,
    role: userData.role || userData.profileType || 'brand'
  });

  const persistUser = (userData) => {
    const normalizedUser = normalizeUser(userData);
    setUser(normalizedUser);
    localStorage.setItem('loggedInUser', JSON.stringify(normalizedUser));
    localStorage.setItem('userData', JSON.stringify(normalizedUser));
    return normalizedUser;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser') || localStorage.getItem('userData');
    if (storedUser) {
      try {
        persistUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    persistUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
  };

  const updateUser = (userData) => {
    setUser((prevUser) => {
      const mergedUser = normalizeUser({ ...prevUser, ...userData });
      localStorage.setItem('loggedInUser', JSON.stringify(mergedUser));
      localStorage.setItem('userData', JSON.stringify(mergedUser));
      return mergedUser;
    });
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
