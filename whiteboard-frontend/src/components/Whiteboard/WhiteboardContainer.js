import React, { useState, useEffect } from 'react';
import socket from '../../utils/socket';
import Whiteboard from './Whiteboard';
import './WhiteboardContainer.css';

const WhiteboardContainer = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`whiteboard-container ${isFullscreen ? 'fullscreen' : ''}`}>
      <button className="toggle-fullscreen" onClick={toggleFullscreen}>
        {isFullscreen ? 'Exit Fullscreen' : 'Expand to Fullscreen'}
      </button>
      <div className="whiteboard-inner-container">
        <div className="whiteboard-wrapper">
          <Whiteboard isFullscreen={isFullscreen} />
        </div>
      </div>
    </div>
  );
};

export default WhiteboardContainer;
