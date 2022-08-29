const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const PORT = process.env.PORT || 3000;

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);

// Websocket
const io = socketio(server);
io.on("connection", (socket) => {
  console.log("first");
  socket.emit("message", "Welcome to Lobby!");
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
