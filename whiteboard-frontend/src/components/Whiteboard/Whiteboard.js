import React, { useRef, useEffect } from 'react';
import socket from '../../utils/socket';
import './Whiteboard.css';

const Whiteboard = ({whiteboardId, user, drawingData}) => {
  const canvasRef = useRef(null);
  const colorsRef = useRef(null);
  const socketRef = useRef();
  console.log("Drawing data: ", drawingData)

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // ----------------------- Colors --------------------------------------------------

    const colors = document.getElementsByClassName('color');
    //console.log(colors, 'the colors');
    //console.log(colorsRef.current);
    // set the current color
    const current = {
      color: 'black',
    };

    // helper that will update the current color
    const onColorUpdate = (e) => {
      current.color = e.target.className.split(' ')[1];
    };

    // loop through the color elements and add the click event listeners
    for (let i = 0; i < colors.length; i++) {
      colors[i].addEventListener('click', onColorUpdate, false);
    }
    let drawing = false;

    // ------------------------------- create the drawing ----------------------------

    const drawLine = (x0, y0, x1, y1, color, emit) => {
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.stroke();
      context.closePath();

      if (!emit) { return; }
      const w = canvas.width;
      const h = canvas.height;

      socketRef.current.emit('drawing', {
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color,
        whiteboardId,
        drawedBy: user
      });
    };

    // Helper function to get clientX and clientY
    const getClientOffset = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches.length > 0 && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches.length > 0 && e.touches[0].clientY);
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    };

    // ---------------- mouse movement --------------------------------------

    const onMouseDown = (e) => {
      e.preventDefault();  // Prevents default touch actions like scrolling
      drawing = true;
      const { x, y } = getClientOffset(e);
      current.x = x;
      current.y = y;
    };

    const onMouseMove = (e) => {
      if (!drawing) { return; }
      const { x, y } = getClientOffset(e);
      drawLine(current.x, current.y, x, y, current.color, true);
      current.x = x;
      current.y = y;
    };

    const onMouseUp = (e) => {
      if (!drawing) { return; }
      drawing = false;
    };

    // ----------- limit the number of events per second -----------------------

    const throttle = (callback, delay) => {
      let previousCall = new Date().getTime();
      return function() {
        const time = new Date().getTime();

        if ((time - previousCall) >= delay) {
          previousCall = time;
          callback.apply(null, arguments);
        }
      };
    };

    // -----------------add event listeners to our canvas ----------------------

    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('mouseout', onMouseUp, false);
    canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

    // Touch support for mobile devices
    canvas.addEventListener('touchstart', onMouseDown, false);
    canvas.addEventListener('touchend', onMouseUp, false);
    canvas.addEventListener('touchcancel', onMouseUp, false);
    canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

    // -------------- make the canvas fill its parent component -----------------

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', onResize, false);
    onResize();

    // ----------------------- socket.io connection ----------------------------
    const onDrawingEvent = (data) => {
      const w = canvas.width;
      const h = canvas.height;
      drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    }

    socketRef.current = socket.connect('/');
    socketRef.current.on('drawing', onDrawingEvent);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const drawInitialData = (data) => {
      console.log("data: ", data);
      data.forEach((item) => {
        console.log("Item: ", item);
        const { x0, y0, x1, y1 } = item;
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.stroke();
      });
    };

    if (drawingData && drawingData.length > 0) {
      drawInitialData(drawingData);
    }
  }, [drawingData]);


  // ------------- The Canvas and color elements --------------------------

  return (
    <div className="whiteboard-canvas-container">
      <canvas ref={canvasRef} className="whiteboard-canvas" />

      <div ref={colorsRef} className="colors">
        <div className="color black" />
        <div className="color red" />
        <div className="color green" />
        <div className="color blue" />
        <div className="color yellow" />
      </div>
    </div>
  );
};

export default Whiteboard;