import React, { useState, useEffect, useCallback } from 'react';
import './Room.css';
import { useRoom } from '../../Context/RoomContext';
import { useAuth } from '../../Context/AuthContext';
import InfiniteBoard from '../Whiteboard/InfiniteBoard';
import Sidebar from '../Sidebar/Sidebar';
import SocketContext from '../../Context/SocketContext';

const ExploreBox = ({roomCodeFromClient, setRoomCodeFromClient, handleJoinRoom, handleCreateRoom }) => {
  return (
    <div className="explore-box">
        <div className="room-option">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomCodeFromClient}
            onChange={(e) => setRoomCodeFromClient(e.target.value)}
          />
          <button onClick={handleJoinRoom}>Enter</button>
          <div className="create-room-label">
            <span onClick={handleCreateRoom}>Create Room</span>
            </div>  
        </div>
    </div>
  );
};

const Room = (props) => {
  //const [errorMsg, setErrorMsg] = useState('');
  const [roomCodeFromClient, setRoomCodeFromClient] = useState('');
  const socket = props.socket;
  const {createRoom, roomCode, addParticipant} = useRoom();
  const {user} = useAuth();


  // Join Room
  const handleJoinedRoom = useCallback((data, userAdded) => {
    console.log("User joined the room...", data, userAdded, user);
    if (userAdded.name === user.name) {
      console.log("I joined the room...", data, userAdded.name);
      createRoom(data);
    } else {
      console.log(`${userAdded.name} has joined the room...`, data);
      addParticipant(userAdded);
    }
    // eslint-disable-next-line   
  }, [user]);

  const handleRoomCreated = useCallback((data) => {
    console.log("A room had been created", data);
    createRoom(data);
    // eslint-disable-next-line   
  }, []);

  useEffect(() => {
    if(!socket) return;
    socket.on('joined-room', handleJoinedRoom);
    socket.on('room-created', handleRoomCreated);

    // Clean up the effect
    return () => {
      socket.off('joined-room', handleJoinedRoom);
      socket.off('room-created', handleRoomCreated);
    };
    // eslint-disable-next-line   
  }, [handleJoinedRoom, handleRoomCreated]);


  // Create Room
  const handleCreateRoom = () => {
    socket.emit('create-room');
  };

  // Join Room
  const handleJoinRoom = () => {
    socket.emit('join-room', { roomId: roomCodeFromClient });
  };

  return (
    <div className='room-container'>
      {roomCode ? (
        <>
          <div className='side-bar-container'>
            <Sidebar />
          </div>
          <div className='board-container'>
            <InfiniteBoard/>
          </div>
        </>
      ) : (
        <ExploreBox
          roomCodeFromClient={roomCodeFromClient}
          setRoomCodeFromClient={setRoomCodeFromClient}
          handleJoinRoom={handleJoinRoom}
          handleCreateRoom={handleCreateRoom}
          //errorMsg={errorMsg}
        />
      )}
    </div>
  );
};

const RoomWithSocket = props => (
  <SocketContext.Consumer>
    {socket => <Room {...props} socket={socket} />}
  </SocketContext.Consumer>
)

export default RoomWithSocket;
