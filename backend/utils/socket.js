const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "https://viralmantrix.com",
        "https://www.viralmantrix.com",
        "http://localhost:5174",
        "http://localhost:5173"
      ],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join admin room if the client is an admin
    socket.on('join-admin', () => {
      socket.join('admin-room');
      console.log(`Socket ${socket.id} joined admin-room`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const emitToAdmin = (event, data) => {
  if (io) {
    io.to('admin-room').emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToAdmin
};
