import React, { useState, useEffect } from 'react';
import Whiteboard from './Whiteboard';
import { useSocket } from '../../Context/SocketContext';
import './WhiteboardContainer.css';

const WhiteboardContainer = () => {
  const user = JSON.parse(localStorage.getItem('session'));
  const {socket} = useSocket();
  const [whiteboard, setWhiteboard] = useState(null);
  const [drawingData, setDrawingData] = useState(null);
  // Transform function should be defined before it's used
  const transformDrawingData = (data) => {   
    if(!data || !data.drawedBy) return; 
    const transformedData = {};
    console.log("Data: ", data);
    data.drawingData.forEach((item, index) => {
      transformedData[index] = {
        [data.drawedBy]: {
          x0: item[0],
          y0: item[1],
          x1: item[2],
          y1: item[3]
        }
      };
    });
    return transformedData;
  };

  useEffect(() => {
    if (!socket) {
      console.log("Socket connection is not available yet");
      return;
    }

    console.log("Socket connection is available in whiteboard");
    const room = JSON.parse(localStorage.getItem('room-session'));
    if (room) {
      setDrawingData(transformDrawingData(room.whiteboard));
      setWhiteboard(room.whiteboard);
    }
    else {
      console.log("No room session found, emiting data");
      socket.emit('fetch-board');
    }

    const handleBoardFetched = (data) => {
      localStorage.setItem('board-session', JSON.stringify(data));
      const room = JSON.parse(localStorage.getItem('room-session'));
      console.log("Someone fetched the board...", room);
    };

    socket.on('board-fetched', handleBoardFetched);

    return () => {
      socket.off('fetch-board', handleBoardFetched);
    };
  }, [socket]);

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-inner-container">
          <Whiteboard user={user.uid} drawingData={drawingData} whiteboardId={whiteboard?._id || null} />
      </div>
    </div>
  );
};

export default WhiteboardContainer;
