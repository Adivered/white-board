import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import AuthProvider from './Context/AuthContext';
import SocketProvider from './Context/SocketContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <SocketProvider>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </SocketProvider>
);