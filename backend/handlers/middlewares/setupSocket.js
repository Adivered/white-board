const {generateRoomController, fetchRoomController, joinRoomController,exitRoomController} = require('../controllers/roomController');
const {updateWhiteboard, getWhiteboardByInstance, removeDrawingFromWhiteboard} = require('../controllers/whiteboardController');

const setupSocket = (io) => {
  io.use((socket, next) => {
    const req = socket.request;
    console.log("Socket middleware - checking session");

    // More robust session handling
    if (!req.session) {
      console.error("No session found");
      return next(new Error('Authentication error'));
    }
    if(req.session.xAuth) {
      console.log("Session found in socket:", req.session.xAuth);
      console.log("Session store (socket):", req.session);
      next();
    }
    else {
      console.error("Invalid or expired session");
      next(new Error('Authentication required'));
    }
  });

  io.on("connection", (socket) => {
    try {
      console.log(`User connected: ${socket.id}`);

      // Join a room
      socket.on('join-room', (roomId) => {
        joinRoomController(socket.request, socket.response, roomId)
          .then((result) => {
            socket.request.session.room = result;
            socket.join(result.roomId);
            console.log(`${socket.request.session.name} has joined room: ${result.roomId}`);
            io.to(result.roomId).emit('joined-room', result, {
              _id: socket.request.session.uid, 
              name: socket.request.session.name
            });
            socket.request.session.save();
          })
          .catch(err => console.log('Error joining room:', err));
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

      socket.on("disconnect", () => {
        console.log(`Socket disconnected for user: ${socket.id}`);
      });

    } catch (err) {
      console.error("Socket connection error:", err);
      socket.disconnect();
    }
  });
};

module.exports = setupSocket;