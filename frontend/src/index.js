import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import AuthProvider from './Context/AuthContext';
import SocketContext from './Context/SocketContext';
import * as serviceWorker from './serviceWorker';
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_BASE_URL, {
  secure: true,
  withCredentials: true,
  rejectUnauthorized: false,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <SocketContext.Provider value = {socket}>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </SocketContext.Provider>
);

serviceWorker.register();