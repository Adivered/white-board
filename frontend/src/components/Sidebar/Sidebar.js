import React, {useEffect, useState, useCallback} from "react";
import "./Sidebar.css";
import SocketContext from "../../Context/SocketContext";
import { useRoom } from "../../Context/RoomContext";
import { useNavigate } from "react-router-dom";

import {ReactComponent as Pallete } from "../../assets/images/pallete.svg";
import {ReactComponent as Crayola } from "../../assets/images/crayola.svg";
import {ReactComponent as Eraser } from "../../assets/images/eraser.svg";

// Room Information Component
const RoomInfo = React.memo(({ roomCode, participants }) => {
  return (
    <div className="room-info-container">
      <div className="room-text">
        <p className="id">Room ID:</p>
        <p className="code">{roomCode}</p>
      </div>
      <div className="room-text">
        <p className="participants">Participants:</p>
        <ul>
          {participants?.map(participant => (
            <li key={participant._id}>{participant.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
});

const Sidebar = (props) => {
  const socket = props.socket;
  const {roomCode, participants, exitRoom, removeParticipant, setPencilColor, setEraser} = useRoom();
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState('pencil');
  const [showColorPalette, setShowColorPalette] = useState(false);

  const toggleColorPalette = () => {
    setShowColorPalette(!showColorPalette);
  };

  const onColorUpdate = (e) => {
    let color = e.target.className.split(' ')[1]; 
    setPencilColor(color);
    setEraser(false);
    toggleColorPalette();
    console.log("Color updated..", color);
  };

  const handleToolClick = (toolName) => {
    setActiveTool(toolName);
    if (toolName === 'eraser') {
      setEraser(true);
      console.log("Eraser updated..");
    } else if (toolName === 'pallete') {
      setEraser(false);
      toggleColorPalette();
    } else {
      setEraser(false);
    }
  };

  const handleRoomExit = useCallback((data) => {
    console.log("Someone left the room...", data);
    removeParticipant(data);
    // eslint-disable-next-line   
  }, []);

  // Leave Room
  const handleLeaveRoom = useCallback(() => {
    socket.emit('leave-room');
    exitRoom();
    navigate('/');
    // eslint-disable-next-line   
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('left-room', handleRoomExit);

    return () => {
      socket.off('left-room', handleRoomExit);
    };
    // eslint-disable-next-line   
  }, [handleRoomExit]);

  

  return (
    <div className="sidebar">
      <RoomInfo roomCode={roomCode} participants={participants} />
      <div className="tools-container">
        <Pallete 
          className={`sidebar-button pallete ${activeTool === 'pallete' ? 'active' : ''}`}
          onClick={() => handleToolClick('pallete')}
        />
        <Crayola 
          className={`sidebar-button crayola ${activeTool === 'crayola' ? 'active' : ''}`}
          onClick={() => handleToolClick('crayola')} 
        />
        <Eraser 
          className={`sidebar-button eraser ${activeTool === 'eraser' ? 'active' : ''}`}
          onClick={() => handleToolClick('eraser')} 
        />
        {showColorPalette && (
          <div className={`color-palette ${showColorPalette ? 'show' : ''}`}>
            <div className={`color-row ${showColorPalette ? 'expand' : ''}`}>
              <div className="color black" title="Black" onClick={onColorUpdate}></div>
              <div className="color red" title="Red" onClick={onColorUpdate}></div>
              <div className="color green" title="Green" onClick={onColorUpdate}></div>
            </div>
            <div className={`color-row ${showColorPalette ? 'expand' : ''}`}>
              <div className="color blue" title="Blue" onClick={onColorUpdate}></div>
              <div className="color yellow" title="Yellow" onClick={onColorUpdate}></div>
              <div className="color purple" title="Purple" onClick={onColorUpdate}></div>
            </div>
          </div>
        )}
      </div>
      <div className="exit-room">
        <button className="exit-room-button" onClick={handleLeaveRoom}>Exit Room</button>
      </div>
    </div>
  );
};

const SidebarWithSocket = props => (
  <SocketContext.Consumer>
    {socket => <Sidebar {...props} socket={socket} />}
  </SocketContext.Consumer>
)

export default SidebarWithSocket;