import React, { createContext, useContext, useEffect, useState } from 'react';

const RoomContext = createContext();

export const useRoom = () => {
  return useContext(RoomContext);
};

const RoomProvider = ({ children }) => {
    const [roomId, setRoomId] = useState(null);
    const [roomCode, setRoomCode] = useState(null);
    const [participants, setParticipants] = useState(null);
    const [whiteboard, setWhiteboard] = useState(null);
    const [scale, setScale] = useState(1);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [pencilColor, setPencilColor] = useState('black');
    const [pencilWidth, setPencilWidth] = useState(1);
    const [eraser, setEraser] = useState(false);
  
    useEffect(() => {
        restoreRoom();
    }, []);

    const createRoom = (data) => {
        setRoomId(data._id);
        setRoomCode(data.roomId);
        setParticipants(data.participants);
        setWhiteboard(data.whiteboard);
        console.log("A Room had been created: ", data);
    }

    const restoreRoom = () => {
        const savedRoom = JSON.parse(localStorage.getItem('room-session'));
        if (savedRoom) {
          setRoomId(savedRoom.roomId);
          setRoomCode(savedRoom.roomCode);
          setParticipants(savedRoom.participants);
          setWhiteboard(savedRoom.whiteboard);
          setScale(savedRoom.scale || 1);
          setOffsetX(savedRoom.offsetX || 0);
          setOffsetY(savedRoom.offsetY || 0);
          setPencilColor(savedRoom.pencilColor || 'black');
          setPencilWidth(savedRoom.pencilWidth || 1)
          setEraser(savedRoom.eraser || false);
        }
        console.log("Room had been restored from storage: ", savedRoom);
      };


    const addParticipant = (participant) => {
        setParticipants((prevParticipants) => [...prevParticipants, participant]);
      };

      const removeParticipant = (participant) => {
        console.log("Removing participant: ", participant);
        setParticipants((prevParticipants) =>
          prevParticipants.filter((p) => p._id !== participant)
        );
        console.log("Participants: ", participants);
      };
  
      const addDrawing = (drawing) => {
        setWhiteboard((prevWhiteboard) => ({
          ...prevWhiteboard,
          drawingData: [...(prevWhiteboard?.drawingData || []), drawing],
        }));
      };
  
      const removeDrawing = (toRemove) => {
        // console.log("Removing drawing: ", toRemove);
        setWhiteboard((prevWhiteboard) => {
          const tolerance = 10; // Tolerance of ±5 units
          const newDrawingData = prevWhiteboard.drawingData.filter((drawing) => {
            // console.log("Drawing to compare: ", drawing);
            const isMatch =
              Math.abs(drawing.x0 - toRemove.x0) <= tolerance &&
              Math.abs(drawing.y0 - toRemove.y0) <= tolerance &&
              Math.abs(drawing.x1 - toRemove.x1) <= tolerance &&
              Math.abs(drawing.y1 - toRemove.y1) <= tolerance;
            return !isMatch;
          });
          return {
            ...prevWhiteboard,
            drawingData: newDrawingData,
          };
        });
      };

    const exitRoom = () => {
      setRoomId(null);
      setRoomCode(null);
      setParticipants(null);
      setWhiteboard(null);
      setScale(1);
      setOffsetX(0);
      setOffsetY(0);
      setPencilColor('black');
      setPencilWidth(1);
      setEraser(false);
      localStorage.removeItem('room-session');
    };

    useEffect(() => {
        const room = { roomId, roomCode, participants, whiteboard , scale, offsetX, offsetY, pencilColor, pencilWidth, eraser};
        localStorage.setItem('room-session', JSON.stringify(room));

    }, [roomId, roomCode, participants, whiteboard, scale, offsetX, offsetY, eraser, pencilColor, pencilWidth]);

  return (
    <RoomContext.Provider value={{
        roomId, roomCode, participants, whiteboard,
        scale, offsetX, offsetY, pencilColor, pencilWidth, eraser,
        createRoom, setRoomCode, addParticipant, 
        removeParticipant, addDrawing,removeDrawing, 
        exitRoom, setScale, setOffsetX, setOffsetY,
        setPencilColor, setPencilWidth, setEraser
        }}>
      {children}
    </RoomContext.Provider>
  );
};

export default RoomProvider;