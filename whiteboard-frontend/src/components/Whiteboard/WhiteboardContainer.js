import React, { useState, useEffect } from 'react';
import socket from '../../utils/socket';
import Whiteboard from './Whiteboard';
import './WhiteboardContainer.css';

const WhiteboardContainer = ({ user, roomId, whiteboard }) => {
  
  // Transform function should be defined before it's used
  const transformDrawingData = (data) => {
    console.log("Data: ", data);
    
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
  console.log("Whiteboard: ", whiteboard);

  // Initial state for drawing data
  const [drawingData, setDrawingData] = useState(transformDrawingData(whiteboard.drawingData || []));
  console.log("Drawing: ", drawingData);

  const fetchWhiteboard = async (whiteboardId) => {
    try {
      const response = await fetch('http://10.0.0.2:5000/fetch-whiteboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ whiteboardId }),
      });

      const result = await response.json();

      if (response.status === 200) {
        return result.data;
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
      if (!whiteboard) {
        const data = await fetchWhiteboard(whiteboard._id);
        if (data) {
          setDrawingData(transformDrawingData(data));
        }
      }
    };

    initializeWhiteboard();
  }, [whiteboard._id]);

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-inner-container">
        <div className="whiteboard-wrapper">
          <Whiteboard user={user} drawingData={drawingData} whiteboardId={whiteboard._id} />
        </div>
      </div>
    </div>
  );
};

export default WhiteboardContainer;
