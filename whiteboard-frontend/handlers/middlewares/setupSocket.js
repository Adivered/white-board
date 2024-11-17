const { Server } = require('socket.io');
const { Whiteboard } = require('../../database/models/whiteboard');
const {session} = require('express-session');
module.exports = function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://10.0.0.2:3000", // Adjust to match your frontend's URL
      methods: ["GET", "POST"],
      withCredentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('drawing', async (data) => {
      //console.log('drawing event received:', data);
      const session = socket.request.session;
      let whiteboard = session.room.whiteboard._id;
      let drawedBy = session.uid;

      const { x0, y0, x1, y1 } = data;
      const drawingData = { x0, y0, x1, y1 };

      try {
        whiteboard = await Whiteboard.findById(whiteboard);
        await whiteboard.addDrawing(drawedBy, drawingData);
        await whiteboard.save();
        session.room.whiteboard = whiteboard;
        console.log('Whiteboard saved:', whiteboard);
      } catch (error) {
        console.error('Error saving drawing data:', error);
      }

      socket.broadcast.emit('drawing', data);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  return io;
};
