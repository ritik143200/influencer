import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../data/config';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Get the base URL for the socket connection (remove /api if it exists)
    const socketUrl = API_BASE_URL.replace('/api', '');
    
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      
      // Check if user is admin and join admin room
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.role === 'admin') {
        newSocket.emit('join-admin');
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
