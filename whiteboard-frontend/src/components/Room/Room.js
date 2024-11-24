import React, { useState, useEffect } from 'react';
import WhiteboardContainer from '../Whiteboard/WhiteboardContainer'; // Make sure to import the WhiteboardContainer component
import './Room.css';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../Context/SocketContext';

const Room = ({ user }) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [showRoomOptions, setShowRoomOptions] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [roomData, setRoomData] = useState(null);
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) {
      console.log("Socket connection is not available yet");
      return;
    }
    console.log("Socket connection is available in room");
    const handleJoinedRoom = (data, name) => {
      if (name === user) {
        console.log("I joined the room...", data, name);
        setRoomData(data);
      } else {
        console.log("Someone else joined the room...", data, name);
        socket.emit('fetch-room');
      }
    };

    const handleRoomCreated = (data) => {
      console.log("A room had been created");
      console.log("Data: ", data);
      setRoomData(data);
      localStorage.setItem('room-session', JSON.stringify(data));
    };

    const handleRoomFetched = (data) => {
      console.log("Someone fetched the room...", data);
      localStorage.setItem('room-session', JSON.stringify(data));
      setRoomData(data);
    };

    const handleRoomExit = (data) => {
      console.log("Someone left the room...", data);
      let session = JSON.parse(localStorage.getItem('session'));
      let name = session.name;
      console.log("handle room session: ", session);
      console.log("My name: ", name);
      console.log("Data name: ", data.name);

      if(data.name == name) {
        console.log("Its me..");
        setRoomData(null);
        localStorage.removeItem('room-session');
        navigate('/');
      } else {
        socket.emit('fetch-room');
      }
    };

    socket.on('joined-room', handleJoinedRoom);
    socket.on('room-created', handleRoomCreated);
    socket.on('room-fetched', handleRoomFetched);
    socket.on('left-room', handleRoomExit);

    // Clean up the effect
    return () => {
      socket.off('joined-room', handleJoinedRoom);
      socket.off('room-created', handleRoomCreated);
      socket.off('room-fetched', handleRoomFetched);
      socket.off('left-room', handleRoomExit);
    };
  }, [socket]);

  // Check if room data exists in localStorage on initial load
  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('room-session'));
    console.log("Session useEffect: (room-session)", session);
    if (session && socket) {
      socket.emit('fetch-room');
    }
  }, []);

  // Create Room
  const handleCreateRoom = () => {
    if (roomData) {
      console.log("Room already exists:", roomData);
      setErrorMsg("Room already exists. You're already in a room.");
      return;
    }
    socket.emit('create-room', { roomId });
  };

  // Join Room
  const handleJoinRoom = () => {
    if (roomData) {
      console.log("Already joined room:", roomData);
      setErrorMsg("Already joined this room.");
      return;
    }
    socket.emit('join-room', { roomId });
  };


  // Leave Room
  const handleLeaveRoom = () => {
    if (!roomData) {
      setErrorMsg("User is not found in any room.");
      return;
    }
    socket.emit('leave-room');
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
          <WhiteboardContainer />

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
