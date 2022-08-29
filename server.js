const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/users");
const { findGame } = require("./utils/matchMaker");

const app = express();
const PORT = process.env.PORT || 3000;

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);

// Websocket
const io = socketio(server);
const botName = "Lobby Bot";

// Run when a client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to BattleShip Game lobby!")); // only to client that triggers

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit("message", formatMessage(botName, `${user.username} has joined the chat`)); // all except the client that triggers

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // Listen for findGame click
  socket.on("findGame", () => {
    const currentUser = getCurrentUser(socket.id);
    console.log(currentUser.username, "wants a game");
    const playerMatch = findGame(socket.id);
    if (playerMatch) {
      console.log(playerMatch);
      console.log("Starting Game between ", playerMatch.username, "and", currentUser.username);
      io.to("lobby").emit(
        "message",
        formatMessage(
          botName,
          `Starting game between ${playerMatch.username} and ${currentUser.username}`
        )
      );
      io.to("lobby").emit("match", playerMatch);
    } else {
      io.to("lobby").emit(
        "message",
        formatMessage(botName, `${currentUser.username} is looking for a game`)
      );
    }
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
