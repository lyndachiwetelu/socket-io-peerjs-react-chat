const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", //replace with your client URL
    methods: ["GET", "POST"]
  },
});
const cors = require('cors')

app.use(cors())

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on('join-room', (id) => {
    socket.broadcast.emit('user-connected', id)
  })

  socket.on('disconnect', () => {
    console.log('a user disconnected');
  })
});

const srv = server.listen(3001, () => {
  console.log('listening on *:3001');
});

app.use('/chat', require('peer').ExpressPeerServer(srv, {
	debug: true
}))