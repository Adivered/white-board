import React, { useRef, useEffect, useCallback } from "react";
import SocketContext from "../../Context/SocketContext";
import { useRoom } from "../../Context/RoomContext";
import {useAuth} from "../../Context/AuthContext";

const InfiniteBoard = (props) => {
  const canvasRef = useRef(null);
  const socket = props.socket;
  const {user} = useAuth();
  const {whiteboard, addDrawing, removeDrawing, pencilColor, eraser, scale, setScale, offsetX, offsetY, setOffsetX, setOffsetY} = useRoom();
  // coordinates of our cursor
  const cursorX = useRef(0);
  const cursorY = useRef(0);
  const prevCursorX = useRef(0);
  const prevCursorY = useRef(0);

  // mouse states
  const leftMouseDown = useRef(false);
  const rightMouseDown = useRef(false);

  // touch states
  const singleTouch = useRef(false);
  const doubleTouch = useRef(false);

  // touch functions
  const prevTouches = useRef([null, null]);


  // convert coordinates
  const toScreenX = (xTrue) =>{
    return (xTrue + offsetX) * scale;
  }
  const toScreenY= (yTrue) => {
    return (yTrue + offsetY) * scale;
  }
  const toTrueX = (xScreen) => {
    return (xScreen / scale) - offsetX;
  }
  const toTrueY = (yScreen) => {
    return (yScreen / scale) - offsetY;
  }

  // Should go in useEffect
  const trueHeight= () => {
    const canvas = canvasRef.current;
    return canvas.clientHeight / scale;
  }
  const trueWidth = () => {
    const canvas = canvasRef.current;
    return canvas.clientWidth / scale;
  }

  const drawLine = (x0, y0, x1, y1, color) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 1;
    context.stroke();
  };

  const emitDrawing = (x0, y0, x1, y1, color) => {
    socket.emit('drawing', {
      x0: x0,
      y0: y0,
      x1: x1,
      y1: y1,
      color,
      drawedBy: user.uid,
    });
  };

  const emitErasing = (x0, y0, x1, y1) => {
    socket.emit('erasing', {
      x0: x0,
      y0: y0,
      x1: x1,
      y1: y1,
    });
  };

  const drawGrid = () => {
    const gridSize = 60;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    context.lineWidth = 1;

    for (let x = 0; x <= canvas.width; x += gridSize) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();
    }

    for (let y = 0; y <= canvas.height; y += gridSize) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();
    }
  };

  const redrawCanvas = useCallback(() => {
    // set the canvas to the size of the window
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    if (whiteboard && whiteboard.drawingData.length > 0) {
      whiteboard.drawingData.forEach((item) => {
        const { x0, y0, x1, y1, color } = item;
        drawLine(          
          toScreenX(x0),
          toScreenY(y0),
          toScreenX(x1),
          toScreenY(y1),
          color,
        )
      });
    }
  }, [whiteboard, scale, offsetX, offsetY]);

  // Socket event listeners

  const onDrawingEvent = useCallback((data, color) => {
    drawLine(data.x0, data.y0, data.x1, data.y1, color);
    addDrawing({
      x0: data.x0,
      y0: data.y0,
      x1: data.x1,
      y1: data.y1,
      color: color
    });
  }, []);

  const onErasingEvent = useCallback((data) => {
    removeDrawing({
      x0: data.x0,
      y0: data.y0,
      x1: data.x1,
      y1: data.y1,
    });
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    // Socket course listening
    socket.on('drawed', onDrawingEvent);
    socket.on('erased', onErasingEvent);

    return () => {
      if (socket) {
        socket.off('drawed', onDrawingEvent);
        socket.off('erased', onErasingEvent);
      }
    }

  }, [onErasingEvent, onDrawingEvent]);  
  
  // Resizing handler
  useEffect(() => {
    redrawCanvas();

    window.addEventListener("resize", redrawCanvas);
    return () => {
      window.removeEventListener("resize", redrawCanvas);
    };
  },[redrawCanvas, scale, offsetX, offsetY, user]);



  // Mouse functionns
  const onMouseDown = useCallback((event) => {
    // detect left clicks
    if (event.button === 0) {
      leftMouseDown.current = true;
      rightMouseDown.current = false;
    }
    // detect right clicks
    if (event.button === 2) {
      leftMouseDown.current = false;
      rightMouseDown.current = true;
    }
    // get mouse position
    cursorX.current = event.offsetX;
    cursorY.current = event.offsetY;
    prevCursorX.current = event.offsetX;
    prevCursorY.current = event.offsetY;
  }, []);

  const onMouseMove = useCallback((event) => {
    // get mouse position
    cursorX.current = event.offsetX;
    cursorY.current = event.offsetY;

    if (leftMouseDown.current) {
      // Erase the lien
      if (eraser) {
        if (whiteboard.drawingData.length === 0){
          redrawCanvas();
          return;
        }
        emitErasing(prevCursorX.current, prevCursorY.current, cursorX.current, cursorY.current, pencilColor);
        removeDrawing({
          x0: toTrueX(prevCursorX.current),
          y0: toTrueY(prevCursorY.current),
          x1: toTrueX(cursorX.current),
          y1: toTrueY(cursorY.current),        
        });
        redrawCanvas();
      } 
      // draw a line
      else {
        drawLine(prevCursorX.current, prevCursorY.current, cursorX.current, cursorY.current, pencilColor);
        //console.log("Drawing line", prevCursorX.current, prevCursorY.current, cursorX.current, cursorY.current, pencilColor);
        emitDrawing(prevCursorX.current, prevCursorY.current, cursorX.current, cursorY.current, pencilColor);
        addDrawing({
          x0: toTrueX(prevCursorX.current),
          y0: toTrueY(prevCursorY.current),
          x1: toTrueX(cursorX.current),
          y1: toTrueY(cursorY.current),  
          color: pencilColor      
        });
      }
    }
    if (rightMouseDown.current) {
      // move the screen
      setOffsetX(offsetX + (cursorX.current - prevCursorX.current) / scale);
      setOffsetY(offsetY + (cursorY.current - prevCursorY.current) / scale);
      redrawCanvas();
    }
    prevCursorX.current = cursorX.current;
    prevCursorY.current = cursorY.current;
  }, [redrawCanvas, eraser, pencilColor]);

  const onMouseUp = useCallback(() => {
    leftMouseDown.current = false;
    rightMouseDown.current = false;
  }, []);

  const onMouseWheel = useCallback((event) => {
    const canvas = canvasRef.current;
    const deltaY = event.deltaY;
    const scaleAmount = -deltaY / 500;
    setScale(scale * (1 + scaleAmount));

    // zoom the page based on where the cursor is
    let distX = event.offsetX / canvas.clientWidth;
    let distY = event.offsetY / canvas.clientHeight;

    // calculate how much we need to zoom
    const unitsZoomedX = trueWidth() * scaleAmount;
    const unitsZoomedY = trueHeight() * scaleAmount;

    const unitsAddLeft = unitsZoomedX * distX;
    const unitsAddTop = unitsZoomedY * distY;
    setOffsetX(offsetX - unitsAddLeft);
    setOffsetY(offsetY - unitsAddTop);

    redrawCanvas();
  }, [redrawCanvas]);

  // Touch functions
  const onTouchStart = useCallback((event) => {
    if (event.touches.length === 1) {
      singleTouch.current = true;
      doubleTouch.current = false;
    }

    if (event.touches.length === 2) {
      singleTouch.current = false;
      doubleTouch.current = true;
    }
    // store the last touches
    prevTouches.current = [event.touches[0], event.touches[1]];
  }, []);

  const onTouchMove = useCallback((event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch0X = event.touches[0].pageX - rect.left;
    const touch0Y = event.touches[0].pageY - rect.top;
    const prevTouch0X = prevTouches.current[0].pageX - rect.left;
    const prevTouch0Y = prevTouches.current[0].pageY - rect.top;

    // Single touch
    if (singleTouch.current){
      // Erase the line
      if (eraser) {
        if (whiteboard.drawingData.length === 0) return;
        emitErasing(prevTouch0X, prevTouch0Y, touch0X, touch0Y, pencilColor);
        removeDrawing({
          x0: toTrueX(prevTouch0X),
          y0: toTrueY(prevTouch0Y),
          x1: toTrueX(touch0X),
          y1: toTrueY(touch0Y),        
        });
        redrawCanvas();
      } else {
        drawLine(prevTouch0X, prevTouch0Y, touch0X, touch0Y, pencilColor);
        emitDrawing(prevTouch0X, prevTouch0Y, touch0X, touch0Y, pencilColor);
        addDrawing({
          x0: toTrueX(prevTouch0X),
          y0: toTrueY(prevTouch0Y),
          x1: toTrueX(touch0X),
          y1: toTrueY(touch0Y),
          color: pencilColor
        });
      }
    }
    if (doubleTouch.current) {
      // get second touch coordinates
      const touch1X = event.touches[1].pageX - rect.left;
      const touch1Y = event.touches[1].pageY - rect.top;
      const prevTouch1X = prevTouches.current[1].pageX - rect.left;
      const prevTouch1Y = prevTouches.current[1].pageY - rect.top;

      // get midpoints
      const midX = (touch0X + touch1X) / 2;
      const midY = (touch0Y + touch1Y) / 2;
      const prevMidX = (prevTouch0X + prevTouch1X) / 2;
      const prevMidY = (prevTouch0Y + prevTouch1Y) / 2;

      // calculate the distances between the touches
      const hypot = Math.sqrt(Math.pow((touch0X - touch1X), 2) + Math.pow((touch0Y - touch1Y), 2));
      const prevHypot = Math.sqrt(Math.pow((prevTouch0X - prevTouch1X), 2) + Math.pow((prevTouch0Y - prevTouch1Y), 2));

      // calculate the screen scale change
      var zoomAmount = hypot / prevHypot;
      setScale(scale * zoomAmount);
      const scaleAmount = 1 - zoomAmount;

      // calculate how many pixels the midpoints have moved in the x and y direction
      const panX = midX - prevMidX;
      const panY = midY - prevMidY;
      // scale this movement based on the zoom level
      setOffsetX(offsetX + (panX / scale));
      setOffsetY(offsetY + (panY / scale));

      // Get the relative position of the middle of the zoom.
      // 0, 0 would be top left. 
      // 0, 1 would be top right etc.
      const canvas = canvasRef.current;
      var zoomRatioX = midX / canvas.clientWidth;
      var zoomRatioY = midY / canvas.clientHeight;

      // calculate the amounts zoomed from each edge of the screen
      const unitsZoomedX = trueWidth() * scaleAmount;
      const unitsZoomedY = trueHeight() * scaleAmount;

      const unitsAddLeft = unitsZoomedX * zoomRatioX;
      const unitsAddTop = unitsZoomedY * zoomRatioY;
      
      setOffsetX(offsetX + unitsAddLeft);
      setOffsetY(offsetY + unitsAddTop);

      redrawCanvas();
    }
    // Update previous touch positions
    prevTouches.current = [event.touches[0], event.touches[1]];
  }, [eraser, pencilColor, redrawCanvas]);

  const onTouchEnd = useCallback(() => {
    singleTouch.current = false;
    doubleTouch.current = false;
    prevTouches.current = [null, null];
  }, []);

  // Mouse listeners
  useEffect(() => {
    const canvas = canvasRef.current;

    // Mouse Event Handlers
    canvas.addEventListener("mousedown", onMouseDown, {passive: true});
    canvas.addEventListener("mouseup", onMouseUp, {passive: true});
    canvas.addEventListener("mouseout", onMouseUp, {passive: true});
    canvas.addEventListener("mousemove", onMouseMove, {passive: true});
    canvas.addEventListener("wheel", onMouseWheel, {passive: true});

    // Touch Event Handlers
    canvas.addEventListener("touchstart", onTouchStart, {passive: true});
    canvas.addEventListener("touchend", onTouchEnd, {passive: true});
    canvas.addEventListener("touchcancel", onTouchEnd, {passive: true});
    canvas.addEventListener("touchmove", onTouchMove, {passive: true}); 

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseout", onMouseUp);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("wheel", onMouseWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
      canvas.removeEventListener("touchmove", onTouchMove);
    };
  }, [onMouseDown, onMouseMove, onMouseUp, onMouseWheel, onTouchStart, onTouchMove, onTouchEnd]);

  return (
      <canvas ref={canvasRef} className="infinite-react" />
  );
};

const InfiniteBoardWithSocket = props => (
  <SocketContext.Consumer>
    {socket => <InfiniteBoard {...props} socket={socket} />}
  </SocketContext.Consumer>
)

export default InfiniteBoardWithSocket;