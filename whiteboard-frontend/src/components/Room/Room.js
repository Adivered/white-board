import React, { useState, useEffect } from 'react';
import WhiteboardContainer from '../Whiteboard/WhiteboardContainer'; // Make sure to import the WhiteboardContainer component
import './Room.css';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../Context/SocketContext';
import { useRoom } from '../../Context/RoomContext';

const Room = ({ user }) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [showRoomOptions, setShowRoomOptions] = useState(false);
  const [roomCodeFromClient, setRoomCodeFromClient] = useState('');
  const { socket } = useSocket();
  const {createRoom, roomCode, participants, addParticipant, removeParticipant, exitRoom} = useRoom();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) {
      console.log("Socket connection is not available yet");
      return;
    }
    console.log("Socket connection is available in room");

    // Join Room
    const handleJoinedRoom = (data, userAdded) => {
      if (userAdded.name === user) {
        console.log("I joined the room...", data, userAdded.name);
        createRoom(data);
      } else {
        console.log(`${userAdded.name} has joined the room...`, data);
        addParticipant(userAdded);
      }
    };

    const handleRoomCreated = (data) => {
      console.log("A room had been created", data);
      createRoom(data);
    };

    const handleRoomFetched = (data, name) => {
      console.log("Someone fetched the room...", data, name);
      createRoom(data);
    };

    const handleRoomExit = (data) => {
      console.log("Someone left the room...", data);
        removeParticipant(data);
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
  }, [socket, navigate, user]);

  // Create Room
  const handleCreateRoom = () => {
    if (roomCode) {
      console.log("Room already exists:", roomCode);
      setErrorMsg("Room already exists. You're already in a room.");
      return;
    }
    socket.emit('create-room');
  };

  // Join Room
  const handleJoinRoom = () => {
    socket.emit('join-room', { roomId: roomCodeFromClient });
  };

  // Leave Room
  const handleLeaveRoom = () => {
    socket.emit('leave-room');
    exitRoom();
    navigate('/');
  };

  return (
    <div className='room-container'>
      {roomCode ? (
        <div className="room-info-box">
          <h2>Room ID: {roomCode}</h2>
          <h3>Participants:</h3>
          <ul>
          {participants.map(participant => (
            <li key={participant._id}> {participant.name}</li>
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
                      value={roomCodeFromClient}
                      onChange={(e) => setRoomCodeFromClient(e.target.value)}
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
