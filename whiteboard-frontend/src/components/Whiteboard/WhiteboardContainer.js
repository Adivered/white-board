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
    if(!data) return; 
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
  


  // Fetch whiteboard data on mount (if necessary) or when whiteboard._id changes
  // useEffect(() => {
  //   const initializeWhiteboard = async () => {
  //     console.log("Whiteboard: ", whiteboard);
  //   //const data = await fetchWhiteboard();
  //   const data = whiteboard.drawingData;
  //   if (data) {
  //     console.log("New Drawing Data: ", data);
  //     setDrawingData(transformDrawingData(data));
  //   }
  //   };

  //   initializeWhiteboard();
  // }, []);

  useEffect(() => {
    if (!socket) {
      console.log("Socket connection is not available yet");
      return;
    }

    console.log("Socket connection is available in whiteboard");
    if (!drawingData)
      socket.emit("fetch-board");
    const handleBoardFetched = (data) => {
      console.log("Someone fetched the board...", data);
      setDrawingData(transformDrawingData(data.whiteboard));
      setWhiteboard(data.whiteboard);
    };

    socket.on('board-fetched', handleBoardFetched);

    // Clean up the effect
    return () => {
      socket.off('fetch-board', handleBoardFetched);
    };
  }, [socket, whiteboard]);

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-inner-container">
          <Whiteboard user={user.uid} drawingData={drawingData} whiteboardId={whiteboard?._id || null} />
      </div>
    </div>
  );
};

export default WhiteboardContainer;
