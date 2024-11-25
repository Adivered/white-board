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
        }
        console.log("Room had been restored from storage: ", savedRoom);
      };


    const addParticipant = (participant) => {
        setParticipants((prevParticipants) => [...prevParticipants, participant]);
      };

      const removeParticipant = (participant) => {
        setParticipants((prevParticipants) =>
          prevParticipants.filter((p) => p.name !== participant)
        );
      };
  
      const addDrawing = (drawing) => {
        setWhiteboard((prevWhiteboard) => ({
          ...prevWhiteboard,
          drawingData: [...(prevWhiteboard?.drawingData || []), drawing],
        }));
      };
  
    const removeDrawing = () => {
      setWhiteboard(null);
    };

    const exitRoom = () => {
      setRoomId(null);
      setRoomCode(null);
      setParticipants(null);
      setWhiteboard(null);
      localStorage.removeItem('room-session');
    };

    useEffect(() => {
        const room = { roomId, roomCode, participants, whiteboard };
        localStorage.setItem('room-session', JSON.stringify(room));

    }, [roomId, roomCode, participants, whiteboard]);

  return (
    <RoomContext.Provider value={{
        roomId, roomCode, participants, whiteboard, createRoom,
        setRoomCode, addParticipant, removeParticipant, addDrawing, 
        removeDrawing, exitRoom}}>
      {children}
    </RoomContext.Provider>
  );
};

export default RoomProvider;