import React, { useState, useEffect } from 'react';
import Whiteboard from './Whiteboard';
import './WhiteboardContainer.css';

const WhiteboardContainer = () => {
  const session = JSON.parse(localStorage.getItem('session'));
  const whiteboard = session.room.whiteboard;
  
  // Transform function should be defined before it's used
  const transformDrawingData = (data) => {    
    const transformedData = {};
    data.forEach((item, index) => {
      transformedData[index] = {
        [whiteboard.drawedBy]: {
          x0: item[0],
          y0: item[1],
          x1: item[2],
          y1: item[3]
        }
      };
    });
    return transformedData;
  };

  // Initial state for drawing data
  const [drawingData, setDrawingData] = useState(transformDrawingData(whiteboard.drawingData || []));

  const fetchWhiteboard = async () => {
    //console.log("Fetching - whiteboard: ", session.room);
    try {
      const response = await fetch('/fetch-whiteboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.status === 200) {
        localStorage.setItem('session', JSON.stringify(result.session));
        return result.session.room.whiteboard.drawingData;
      } else {
        console.error('Failed to fetch whiteboard data');
      }
    } catch (error) {
      console.error('Error fetching whiteboard data:', error);
    }
    return null;
  };

  // Fetch whiteboard data on mount (if necessary) or when whiteboard._id changes
  useEffect(() => {
    const initializeWhiteboard = async () => {
    const data = await fetchWhiteboard();
    if (data) {
      //console.log("New Drawing Data: ", data);
      setDrawingData(transformDrawingData(data));
    }
    };

    initializeWhiteboard();
  }, []);

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-inner-container">
          <Whiteboard user={session.uid} drawingData={drawingData} whiteboardId={whiteboard._id} />
      </div>
    </div>
  );
};

export default WhiteboardContainer;
