const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/users");
const {
  isBothPlayersFinishedWithShipPlacement,
  setGameState,
  isBothPlayersReadyForGamePlay,
  getGameState,
} = require("./utils/gameState");
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
      .emit("message", formatMessage(botName, `${user.username} has joined the ${user.room}`)); // all except the client that triggers

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("joinGame", ({ user, room }) => {
    //console.log("joinGame found:", user, room);
    userLeave(user.id);
    const newUser = userJoin(user.id, user.username, room);

    socket.join(room);
    // io.to("gameRoom").emit("startGame");
    // Send users and room info to lobby
    io.to("lobby").emit("roomUsers", {
      room: "lobby",
      users: getRoomUsers("lobby"),
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
    //  console.log("currentUser", currentUser);
    const playerMatch = findGame(socket.id);
    if (playerMatch) {
      io.to(currentUser.room).emit("match", { player1: currentUser, player2: playerMatch });
    } else {
      io.to("lobby").emit(
        "message",
        formatMessage(botName, `${currentUser.username} is looking for a game`)
      );
    }
  });

  // Listen for shipPlacement_finished
  socket.on("shipPlacement_finished", ({ playerId, ships }) => {
    setGameState(playerId, "ships", ships);
    if (isBothPlayersFinishedWithShipPlacement()) {
      console.log("both players is finished placing ships, moving on");
      io.to("gameRoom").emit("phase", {
        phase: "shipPlacement_completed",
        gameState: getGameState(),
      });
    }
  });

  // Listen for game play start
  socket.on("startGamePlay", ({ playerId }) => {
    console.log("startgameplay", playerId);
    setGameState(playerId, "gameplay", true);
    if (isBothPlayersReadyForGamePlay()) {
      io.to("gameRoom").emit("phase", { phase: "gameplay" });
    }
  });

  socket.on("endTurn", () => {
    io.to("gameRoom").emit("changePlayer");
  });

  socket.on("gameWinner", ({ name }) => {
    io.to("gameRoom").emit("displayGameOver", name);
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
