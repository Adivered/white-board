import React, { useRef, useEffect } from 'react';
import './Whiteboard.css';
import { useSocket } from '../../Context/SocketContext';
import { useRoom } from '../../Context/RoomContext';

const Whiteboard = ({ user }) => {
  const canvasRef = useRef(null);
  const {socket} = useSocket();
  const socketRef = useRef();
  const {whiteboard, addDrawing, removeDrawing} = useRoom();
  // ------------------- Helper to draw on the canvas ----------------------------

  const drawLine = (x0, y0, x1, y1, color, emit) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 1;
    context.stroke();
    context.closePath();
    if (emit) {
      const w = canvas.width;
      const h = canvas.height;
      socketRef.current.emit('drawing', {
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color,
        drawedBy: user,
      });
      addDrawing({
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h, color });
    }
    return canvas;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const drawInitialData = () => {
      const w = canvas.width;
      const h = canvas.height;
      whiteboard.drawingData.forEach((item) => {
        const { x0, y0, x1, y1, color } = item;
        drawLine(x0*w, y0*h, x1*w, y1*h, color, false);
      });
    };

    // If drawingData exists and is not empty, draw it on the canvas
    if (whiteboard && whiteboard.drawingData.length > 0) {
      drawInitialData();
    } else {
      console.log("No drawing data found..");
    }
  }, []);
    

  useEffect(() => {
    const canvas = canvasRef.current;
    socketRef.current = socket;
    const onDrawingEvent = (data, color) => {
      const w = canvas.width;
      const h = canvas.height;
      drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, color, false);
      addDrawing({
        x0: data.x0 * w,
        y0: data.y0 * h,
        x1: data.x1 * w,
        y1: data.y1 * h,
        color: data.color
      });
    };

    // Socket connection
    if (socketRef.current){
      socketRef.current.on('drawed', onDrawingEvent);
    }
    // Clean up socket connection on component unmount
    return () => {
      if (socketRef.current) {
        console.log("Disconnecting");
      }
    };
  }, [socketRef.current]);

  // ----------------- Canvas Event Handlers for User Drawing ----------------------

  let drawing = false;
  const colorRef = useRef('black');
  let current = { color: 'black' };

  const onColorUpdate = (e) => {
    colorRef.current = e.target.className.split(' ')[1]; 
    console.log("Color updated..", colorRef.current);

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
    drawLine(current.x, current.y, x, y, colorRef.current, true);
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