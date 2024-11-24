import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext({
    socketAuth: null,
    setSocket: () => {},
    socket: null,

});

export const useSocket = () => {
  return useContext(SocketContext);
};

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [socketAuth, setSocketAuth] = useState(null);

  useEffect(() => {
    const isSocketAuth = async () => {
        if (!socket)
            if (!localStorage.getItem('session'))
                return;
              
        try {
            const newSocket = io('/', {
                withCredentials: true,
            });
            setSocket(newSocket);
        } catch (error) {
            console.error('Error setting up socket:', error);
        }
    }
    isSocketAuth();
  }, [socketAuth]);

  return (
    <SocketContext.Provider value={{socketAuth, setSocketAuth, socket}}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;