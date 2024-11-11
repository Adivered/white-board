const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://172.20.10.2:3000", // Adjust the URL to match your frontend's URL
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: "http://172.20.10.2:3000" // Adjust the URL to match your frontend's URL
}));

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('drawing', (data) => {
    console.log('drawing event received:', data); // Log the drawing event
    socket.broadcast.emit('drawing', data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(5000, () => {
  console.log('listening on *:5000');
});