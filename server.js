const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let userCount = 1; // Used to generate unique Guest nicknames

const users = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('set nickname', (nickname) => {
    if (!nickname) {
      nickname = `Guest${userCount++}`;
    }
    users[socket.id] = nickname;
    io.emit('user joined', `${nickname} joined the chat`);
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', { id: socket.id, nickname: users[socket.id], message: msg });
  });

  socket.on('typing', () => {
    socket.broadcast.emit('typing', users[socket.id]);
  });

  socket.on('disconnect', () => {
    io.emit('user left', `${users[socket.id]} left the chat`);
    delete users[socket.id];
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
