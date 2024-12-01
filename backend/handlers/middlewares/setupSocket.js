const { Server } = require('socket.io');
const { Whiteboard } = require('../../database/models/whiteboard');
const { Room } = require('../../database/models/room');
const {generateRoomController, fetchRoomController, joinRoomController,exitRoomController} = require('../controllers/roomController');
const {session} = require('express-session');
let argv = require('minimist')(process.argv.slice(2));
const {updateWhiteboard, getWhiteboardByInstance, removeDrawingFromWhiteboard} = require('../controllers/whiteboardController');

module.exports = function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "https://mern-whiteboard.netlify.app", // Adjust to match your frontend's URL
      methods: ["GET", "POST"],
    },
    pingInterval: 10000,
    pingTimeout: 5000,

  });

  io.on('connection', (socket) => {
    console.log('a user connected');
    if (socket.request.session.room) {
      const roomId = socket.request.session.room._id;
      const userId = socket.request.session.uid;

      isUserParticipant(roomId, userId).then(isParticipant => {
        if (isParticipant) {
          console.log("Reconnecting user..");
          socket.join(socket.request.session.room.roomId);
          //io.to(socket.request.session.room.roomId).emit('joined-room', socket.request.session.room);
        } else {
          console.log("User is not a participant in the room.");
          //delete socket.request.session.room;
        }
      }).catch(error => {
        console.error('Error checking participant:', error);
      });
    }

    // Join a room
    socket.on('join-room', (roomId) => {
      joinRoomController(socket.request, socket.response, roomId)
          .then((result) => {
            socket.request.session.room = result;
            let session = socket.request.session;
            socket.join(session.room.roomId);
            console.log(`${session.name} has joined room: ${session.room.roomId}`);
            io.to(session.room.roomId).emit('joined-room', session.room, {_id: session.uid, name: session.name});
            socket.request.session.save();
          })
          .catch(err => {
              console.error('Error creating room:', err);
          });
    });

    // Leave a room
    socket.on('leave-room', async () => {
      if (!socket.request.session.room)
        return
      let roomId = socket.request.session.room.roomId;
      exitRoomController(socket.request, socket.response)
      .then(() => {
          socket.request.session.room = null;
          socket.broadcast.to(roomId).emit('left-room', socket.request.session.uid);
          socket.leave(roomId);
          console.log(`${socket.request.session.name} has left room: ${roomId}`);
          socket.request.session.save();
      }) .catch(err => {
        console.error('Error creating room:', err);
      });
    });


    socket.on('create-room', () => {
      generateRoomController(socket.request, socket.response)
        .then((result) => {
          socket.request.session.room = result;
          socket.join(socket.request.session.room.roomId);
          console.log(`${socket.request.session.name} has created room: ${socket.request.session.room.roomId}`);
          io.to(socket.request.session.room.roomId).emit('room-created', socket.request.session.room);
          socket.request.session.save();
        })
        .catch(err => {
            console.error('Error creating room:', err);
        });
    });

    socket.on('fetch-room', () => {
      console.log("fetch-room event received");
      if(!socket.request.session.room)
        return;
      fetchRoomController(socket.request, socket.response)
          .then((result) => {
            socket.request.session.room = result;
            console.log(`${socket.request.session.name} has refreshed room: ${socket.request.session.room.roomId}`);
            socket.join(socket.request.session.room.roomId);
            socket.emit('room-fetched', socket.request.session.room, socket.request.session.name);
          })
          .catch(err => {
              console.error('Error creating room:', err);
          });
    });

    socket.on('fetch-board', () => {
      console.log("fetch-board event received");
      if(!socket.request.session.room)
        return;
      getWhiteboardByInstance(socket.request, socket.response)
          .then((result) => {
            socket.request.session.room.whiteboard = result;
            console.log(`${socket.request.session.name} has refreshed whiteboard in room: ${socket.request.session.room.roomId}`);
            io.to(socket.request.session.room.roomId).emit('board-fetched', socket.request.session.room);
          })
          .catch(err => {
              console.error('Error creating room:', err);
          });
    });

    socket.on('drawing', (data) => {
      const { x0, y0, x1, y1 } = data;
      const drawingData = { x0, y0, x1, y1 };
      updateWhiteboard(socket.request, socket.response, data)
        .then((result) => {
          socket.request.session.room.whiteboard = result;
          socket.request.session.save();
          console.log(`${socket.request.session.name} has updated whiteboard in room: ${socket.request.session.room.roomId}`);
          socket.broadcast.to(socket.request.session.room.roomId).emit('drawed', drawingData, data.color);
        })
        .catch(err => {
            console.error('Error drawing in room:', err);
        })
    });

    socket.on('erasing', (data) => {
      const { x0, y0, x1, y1 } = data;
      const drawingData = { x0, y0, x1, y1 };
      removeDrawingFromWhiteboard(socket.request, socket.response, data)
        .then((result) => {
          socket.request.session.room.whiteboard = result;
          socket.request.session.save();
          console.log(`${socket.request.session.name} has erased drawing from whiteboard in room: ${socket.request.session.room.roomId}`);
          socket.broadcast.to(socket.request.session.room.roomId).emit('erased', drawingData);
        })
        .catch(err => {
            console.error('Error drawing in room:', err);
        })
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  return io;
};

const isUserParticipant = async (roomId, userId) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return false;
    }
    return room.participants.includes(userId);
  } catch (error) {
    console.error('Error checking participant:', error);
    return false;
  }
};