import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import './Home.css';

const Home = () => {
  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showRoomOptions, setShowRoomOptions] = useState(false);
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("Token: ", token);
    if (token) {
      fetch('http://172.20.10.2:5000/token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then((res) => res.json().then(data => ({ status: res.status, body: data })))
        .then(({ status, body }) => {
          if (status === 200) {
            console.log("Status: ", status);
            console.log("Body: ", body);
            setUser(body.user);
          } else {
            localStorage.removeItem('token'); // Remove token from local storage
            setErrorMsg(body.msg || 'Failed to fetch user data');
          }
        })
        .catch((err) => {
          console.error('Error fetching user data:', err);
          localStorage.removeItem('token'); // Remove token from local storage
          setErrorMsg('An error occurred while fetching user data');
        });
    }
  }, []);

  const handleCreateRoom = () => {
    // Logic to create a room
    console.log('Create Room');
  };

  const handleJoinRoom = () => {
    // Logic to join a room
    console.log('Join Room');
  };

  return (
    <div>
      <Header />
      <main>
        <section className="intro">
          <h1>Welcome to the Whiteboard App</h1>
          <p>
            Our Whiteboard app allows you to collaborate in real-time with your team. 
            Draw, write, and brainstorm ideas seamlessly on a digital canvas.
          </p>
          {user ? (
            <div className="user-prompt">
              <h2>Hello, {user.name}</h2>
              {!showRoomOptions ? (
                <div className="explore-box" onClick={() => setShowRoomOptions(true)}>
                  <p>Explore Whiteboard</p>
                </div>
              ) : (
                <div className="room-options-box">
                  <div className="room-option">
                    <input
                      type="text"
                      placeholder="Enter Room ID"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                    />
                    <button onClick={handleJoinRoom}>Enter</button>
                  </div>
                  <div className="create-room-label">
                    <button onClick={handleCreateRoom}>Create Room</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>{errorMsg || 'Loading user data...'}</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;