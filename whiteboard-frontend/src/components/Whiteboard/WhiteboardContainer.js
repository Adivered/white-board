import React, { useState, useEffect } from 'react';
import socket from '../../utils/socket';
import Whiteboard from './Whiteboard';
import './WhiteboardContainer.css';

const WhiteboardContainer = () => {
  const [activeUsers, setActiveUsers] = useState([]);
  const roomCredentials = "Room ID: 12345"; // Example room credentials

  useEffect(() => {
    // Listen for active users from the socket
    socket.on('activeUsers', (users) => {
      setActiveUsers(users);
    });

    // Clean up the socket event listener on component unmount
    return () => {
      socket.off('activeUsers');
    };
  }, []);

  return (
    <div className="whiteboard-container">
        <div className="whiteboard-inner-container">
            <div className="room-credentials">
            <h2>{roomCredentials}</h2>
            </div>
            <div className="whiteboard-wrapper">
                <Whiteboard />
            </div>
        </div>
      
      <div className="active-users">
        <h3>Active Users</h3>
        <ul>
          {activeUsers.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WhiteboardContainer;