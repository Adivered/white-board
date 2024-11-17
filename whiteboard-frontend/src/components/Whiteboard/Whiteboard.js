import React, { useRef, useEffect } from 'react';
import socket from '../../utils/socket';
import './Whiteboard.css';

const Whiteboard = ({ whiteboardId, user, drawingData }) => {
  const canvasRef = useRef(null);
  const socketRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // ----------------------- Draw the Initial Data -----------------------------

    const drawInitialData = (data) => {
      const w = canvas.width;
      const h = canvas.height;
      console.log("Initial Data: ", data);
      Object.values(data).forEach((item) => {
        //console.log("Drawing line: ", item);
        const userId = Object.keys(item)[0];
        const { x0, y0, x1, y1, color } = item[userId];
        drawLine(x0* w, y0*h, x1 *w, y1*h, 'black');
      });
    };

    //console.log("Drawing data: ", drawingData);  // Logs the initial drawing data 
    //console.log("Drawing data length: ", Object.keys(drawingData).length);  // Logs the length of the initial drawing data 
    // If drawingData exists and is not empty, draw it on the canvas
    if (drawingData && Object.keys(drawingData).length > 0) {
      drawInitialData(drawingData);
    }

    // ----------------- Socket.io setup for drawing events ----------------------

    const onDrawingEvent = (data) => {
      const w = canvas.width;
      const h = canvas.height;
      drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    };

    // Socket connection
    if (!socketRef.current){
      console.log("Attempting to connect to socket..");
      socketRef.current = socket.connect('/');
      console.log("Socket connected..");
      socketRef.current.on('drawing', onDrawingEvent);
      console.log("Listening on drawing..");
    }
    // Clean up socket connection on component unmount
    return () => {
      if (socketRef.current) {
        console.log("Disconnecting");
        socketRef.current.disconnect();
      }
    };
  }, []);  // Depend on drawingData to trigger re-draw when it changes

  // ------------------- Helper to draw on the canvas ----------------------------

  const drawLine = (x0, y0, x1, y1, color, emit) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();
    if (emit) {
      const w = canvas.width;
      const h = canvas.height;
      console.log("Emitting data");
      socketRef.current.emit('drawing', {
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color,
        whiteboardId,
        drawedBy: user,
      });
      console.log("Sent!");
    }
  };

  // ----------------- Canvas Event Handlers for User Drawing ----------------------

  let drawing = false;
  const current = { color: 'black' };

  const onColorUpdate = (e) => {
    current.color = e.target.className.split(' ')[1];
  };

  // Helper function to get clientX and clientY
  const getClientOffset = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches.length > 0 && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches.length > 0 && e.touches[0].clientY);
    return {
      x: (clientX - rect.left) * (canvasRef.current.width / rect.width),
      y: (clientY - rect.top) * (canvasRef.current.height / rect.height),
    };
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    drawing = true;
    const { x, y } = getClientOffset(e);
    current.x = x;
    current.y = y;
  };

  const onMouseMove = (e) => {
    if (!drawing) return;
    const { x, y } = getClientOffset(e);
    drawLine(current.x, current.y, x, y, current.color, true);
    current.x = x;
    current.y = y;
  };

  const onMouseUp = (e) => {
    if (!drawing) { return; }
    drawing = false;
  };

  // ------------------- Canvas Event Listeners ----------------------------

  useEffect(() => {
    const canvas = canvasRef.current;

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseout', onMouseUp);

      // Touch support for mobile devices
      canvas.addEventListener('touchstart', onMouseDown);
      canvas.addEventListener('touchend', onMouseUp);
      canvas.addEventListener('touchcancel', onMouseUp);
      canvas.addEventListener('touchmove', onMouseMove);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseout', onMouseUp);
      canvas.removeEventListener('touchstart', onMouseDown);
      canvas.removeEventListener('touchend', onMouseUp);
      canvas.removeEventListener('touchcancel', onMouseUp);
      canvas.removeEventListener('touchmove', onMouseMove);
      
    };
  }, []);

  // ------------- The Canvas and Color Elements --------------------------

  return (
    <div className="whiteboard-self-container">
      <div className="canvas-container">
      <canvas ref={canvasRef} className="whiteboard-canvas" />
      </div>
      <div className="colors">
        <div className="color black" onClick={onColorUpdate} />
        <div className="color red" onClick={onColorUpdate} />
        <div className="color green" onClick={onColorUpdate} />
        <div className="color blue" onClick={onColorUpdate} />
        <div className="color yellow" onClick={onColorUpdate} />
      </div>
    </div>
  );
};

export default Whiteboard;
