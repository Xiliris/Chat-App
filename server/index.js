const { createServer } = require('http');
const { Server } = require('socket.io');
const port = 8080;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

let userData = new Map();

io.on('connection', (socket) => {
  let userObj = {
    user: '',
    room: '',
    id: '',
  };

  socket.on('join', (e) => {
    socket.join(e.room);
    io.to(e.room).emit('join', e.user);

    userData.set(socket.id, { user: e.user, room: e.room });
    userList(e.room);
    userObj = {
      user: e.user,
      room: e.room,
      id: socket.id,
    };
  });

  socket.on('disconnect', (e) => {
    if (!userObj.id) return;
    let room = userData.get(userObj.id).room;
    let user = userData.get(userObj.id).user;

    io.to(room).emit('left', user);
    userData.delete(userObj.id);
    userList(room);
  });

  socket.on('message', (message) => {
    let user = message.user;
    let room = message.room;
    let msg = message.msg;

    socket.to(room).emit('message', { user, msg });
  });
});

httpServer.listen(port, () => {
  console.log(`Started on PORT: ${port}`);
});

function userList(room) {
  let usersList = [];

  let rooms = io.of('/').adapter.rooms;
  if (!rooms.get(room)) {
    io.to(room).emit('update-list', null);
    return;
  }

  rooms.get(room).forEach((e) => {
    usersList.push(userData.get(e).user);
  });

  io.to(room).emit('update-list', usersList);
}
