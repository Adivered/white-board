import React, { useState, useEffect } from 'react';
import WhiteboardContainer from '../Whiteboard/WhiteboardContainer'; // Make sure to import the WhiteboardContainer component
import './Room.css';

const Room = ({ user }) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [showRoomOptions, setShowRoomOptions] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [roomData, setRoomData] = useState(null);

  // Check if room data exists in localStorage on initial load
  useEffect(() => {
    const storedRoom = JSON.parse(localStorage.getItem('room'));
    if (storedRoom) {
      fetch('http://10.0.0.2:5000/fetch-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId: storedRoom._id }),
      })
        .then((res) => res.json().then(data => ({ status: res.status, body: data })))
        .then(({ status, body }) => {
          if (status === 200) {
            setRoomData(body.room);
          } else {
            console.error('Error fetching room:', body.message);
            setErrorMsg(body.message || 'Failed to fetch room data');
          }
        })
        .catch((err) => {
          console.error('Error fetching room:', err);
          setErrorMsg('An error occurred while fetching room data');
        });
    } else {
      console.log('No room data found in storage');
    }
  }, []);

  // Render room data
  function renderRoom(roomData) {
    setRoomData(roomData);
  }

  // Create Room
  const handleCreateRoom = () => {
    if (roomData) {
      console.log("Room already exists:", roomData);
      setErrorMsg("Room already exists. You're already in a room.");
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
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
          localStorage.setItem('room', JSON.stringify(body.room)); // Store room data in localStorage
          renderRoom(body.room); // Render the room data
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

  // Join Room
  const handleJoinRoom = () => {
    if (roomData) {
      console.log("Already joined room:", roomData);
      setErrorMsg("Already joined this room.");
      return;
    }

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
          localStorage.setItem('room', JSON.stringify(body.room)); // Store room data in localStorage
          renderRoom(body.room); // Render the room data
        } else {
          console.error('Error joining room:', body.message);
          setErrorMsg(body.error || 'Failed to join room');
        }
      })
      .catch((err) => {
        console.error('Error joining room:', err);
        setErrorMsg('An error occurred while joining the room');
      });
  };

  return (
    <div>
      {roomData ? (
        <div className="room-info-box">
          <h2>Room ID: {roomData.roomId}</h2>
          <h3>Participants:</h3>
          <ul>
            {roomData.participants.map(participantId => (
              <li key={participantId}>{participantId}</li>
            ))}
          </ul>
          {console.log("Room data: ", roomData)}
          <WhiteboardContainer user={user} roomId={roomData.roomId} whiteboard={roomData.whiteboard} />
        </div>
      ) : (
        <>
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
    </div>
  );
};

export default Room;
