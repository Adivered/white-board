import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import WhiteboardContainer from '../Whiteboard/WhiteboardContainer'; // Make sure to import the WhiteboardContainer component
import Whiteboard from '../Whiteboard/Whiteboard'; // Make sure to import the Whiteboard component
import './Home.css';

const Home = () => {
  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showRoomOptions, setShowRoomOptions] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [roomData, setRoomData] = useState(null); // State to hold room data
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("Token: ", token);
    if (token) {
      fetch('http://10.0.0.2:5000/token', {
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
            setErrorMsg(body.msg || 'Failed to fetch user data');
          }
        })
        .catch((err) => {
          console.error('Error fetching user data:', err);
          setErrorMsg('An error occurred while fetching user data');
        });
    }
  }, []);

  const handleCreateRoom = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log("User: ", user);
    fetch('http://10.0.0.2:5000/create-room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: user._id }),
    })
      .then((res) => res.json().then(data => ({ status: res.status, body: data })))
      .then(({ status, body }) => {
        if (status === 200) {
          console.log('Room created:', body.room);
          setRoomData(body.room); // Set the room data
        } else {
          console.error('Error creating room:', body.message);
          setErrorMsg(body.message || 'Failed to create room');
        }
      })
      .catch((err) => {
        console.error('Error creating room:', err);
        setErrorMsg('An error occurred while creating the room');
      });
  };

  const handleJoinRoom = () => {
    const userId = JSON.parse(localStorage.getItem('user'))._id;
    fetch('http://10.0.0.2:5000/join-room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomId, userId }),
    })
      .then((res) => res.json().then(data => ({ status: res.status, body: data })))
      .then(({ status, body }) => {
        if (status === 200) {
          console.log('Joined room:', body.room);
          setRoomData(body.room); // Set the room data
        } else {
          console.error('Error joining room:', body);
          setErrorMsg(body.error);
        }
      })
      .catch((err) => {
        console.error('Error joining room:', err);
        setErrorMsg('An error occurred while joining the room');
      });
  };

  return (
    <div className='main-container'>
      <div className='header-container'>
        <Header />
      </div>
      <main>
        <section className="intro">
          <h1>Whiteboard.io</h1>
          {roomData ? (
            <div className="room-info-box">
              <h2>Room ID: {roomData.roomId}</h2>
              <h3>Participants:</h3>
              <ul>
                {roomData.participants.map(participantId => (
                  <li key={participantId}>{participantId}</li>
                ))}
              </ul>
              <WhiteboardContainer />
            </div>
          ) : (
            <>
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
                      <p>{errorMsg}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p>{errorMsg}</p>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;