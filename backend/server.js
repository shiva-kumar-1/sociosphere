require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./src/app");
const socketHandler = require("./src/sockets");

const PORT = process.env.PORT || 5000;

// create http server
const server = http.createServer(app);

// attach socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // later restrict
    methods: ["GET", "POST"],
  },
});

// initialize socket logic
socketHandler(io);

// start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
