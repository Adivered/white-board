import React, { useState, useEffect } from 'react';
import WhiteboardContainer from '../Whiteboard/WhiteboardContainer'; // Make sure to import the WhiteboardContainer component
import './Room.css';
import { useNavigate } from 'react-router-dom';
import socket from '../../utils/socket';


const Room = ({ user }) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [showRoomOptions, setShowRoomOptions] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [roomData, setRoomData] = useState(null);
  const navigate = useNavigate();


  socket.on('update-participants', () => {
    console.log("Someone joined the room...");
    fetchRoom();
    
  });

  // Check if room data exists in localStorage on initial load
  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('session'));
    if (session && session.room) {
      console.log("Session from room: ", session);
      fetchRoom();
      socket.emit('join-room', session.room.roomId);
    } else {
      console.log('No room data found in storage');
      setRoomData(null);
    }
  }, []);

  // Render room data
  function renderRoom(roomData) {
    setRoomData(roomData);
  }

  // Create Room
  const fetchRoom = () => {
    fetch('/fetch-room', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json().then(data => ({ status: res.status, body: data })))
      .then(({ status, body }) => {
        if (status === 200) {
          console.log("New Session: ", body.session);
          localStorage.setItem('session', JSON.stringify(body.session)); // Update session
          renderRoom(body.session.room);
        } else {
          console.error('Error fetching room:', body.message);
          setErrorMsg(body.message || 'Failed to fetch room data');
        }
      })
      .catch((err) => {
        console.error('Error fetching room:', err);
        setErrorMsg('An error occurred while fetching room data');
      });
  };

  // Create Room
  const handleCreateRoom = () => {
    if (roomData) {
      console.log("Room already exists:", roomData);
      setErrorMsg("Room already exists. You're already in a room.");
      return;
    }

    fetch('/create-room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json().then(data => ({ status: res.status, body: data })))
      .then(({ status, body }) => {
        if (status === 200) {
          console.log('Room created:', body.session.room);
          localStorage.setItem('session', JSON.stringify(body.session)); // Update session
          renderRoom(body.session.room);
          console.log("Emitting", roomData.roomId);
          socket.emit('join-room', roomData.roomId);
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

    fetch('/join-room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomId }),
    })
      .then((res) => res.json().then(data => ({ status: res.status, body: data })))
      .then(({ status, body }) => {
        if (status === 200) {
          console.log('Joined room:', body.session.room);
          localStorage.setItem('session', JSON.stringify(body.session)); // Store room data in localStorage
          renderRoom(body.session.room);
          console.log("Emitting", roomData.roomId);
          socket.emit('join-room', roomData.roomId);
        } else {
          console.error('Error joining room:', body.message);
          setErrorMsg(body.error || 'Failed to join room');
        }
      })
      .catch((err) => {
        console.error('Error join room:', err);
        setErrorMsg('An error occurred while joining the room');
      });
  };


  // Leave Room
  const handleLeaveRoom = () => {
    if (!roomData) {
      setErrorMsg("User is not found in any room.");
      return;
    }

    fetch('/exit-room', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json().then(data => ({ status: res.status, body: data })))
      .then(({ status, body }) => {
        if (status === 200) {
          console.log('Exited room successfuly');
          localStorage.setItem('session', JSON.stringify(body.session)); // Store room data in localStorage
          window.location.reload();
        } else {
          console.error('Error exitting room:', body.message);
          setErrorMsg(body.error || 'Failed to exit room');
        }
      })
      .catch((err) => {
        console.error('Error exitting room:', err);
        setErrorMsg('An error occurred while exitting the room');
      });
  };

  return (
    <div className='room-container'>
      {roomData ? (
        <div className="room-info-box">
          <h2>Room ID: {roomData.roomId}</h2>
          <h3>Participants:</h3>
          <ul>
          {roomData.participants.map(participant => (
            <li key={participant._id}>{participant.name}</li>
          ))}
          </ul>
          <WhiteboardContainer user={user} roomId={roomData.roomId} whiteboard={roomData.whiteboard} />

          <div className="exit-room-button-container">
            <button onClick={handleLeaveRoom}>Exit Room</button>
          </div>
        </div>
      ) : (
        <>
          {user ? (
            <div className="user-prompt">
              <h2>Hello, {user}</h2>
              {!showRoomOptions ? (
                <div className="user-prompt-box">
                  <div className="explore-box" onClick={() => setShowRoomOptions(true)}>
                    <p>Explore Whiteboard</p>
                  </div>
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
                  <p className='p-error'>{errorMsg}</p>
                </div>
              )}
            </div>
          ) : (
            <p className='p-error'>{errorMsg}</p>
          )}
        </>
      )}
    </div>
  );
};

export default Room;
