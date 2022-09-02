const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const findGame = document.getElementById("find-game");
const chat = document.querySelector(".chat-container");

// Globals
const players = [];

// Get username and room from URL
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const socket = io();

// Join chatroom
socket.emit("joinRoom", { username, room: "lobby" });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  if (room === "lobby") {
    outputRoomName(room);
    outputUsers(users);
  }
  console.log(room, users);
});

// Message from server
socket.on("message", (message) => {
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit("chatMessage", msg);

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Find Game
findGame.addEventListener("click", (e) => {
  console.log(username, "looking for a game");
  socket.emit("findGame", username);
});

// Listen for game match/start
socket.on("match", ({ player1, player2 }) => {
  console.log("starting match with players:", player1.username, player2.username);
  // Join game
  if (socket.id === player1.id) socket.emit("joinGame", { user: player1, room: "gameRoom" });
  if (socket.id === player2.id) socket.emit("joinGame", { user: player2, room: "gameRoom" });
  // Start Game
  startGame(player1, player2);
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
   ${message.text}
  </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `${users.map((user) => `<li>${user.username}(${user.room})</li>`).join("")}`;
}

function startGame(player1, player2) {
  // display game
  if (player1.id === socket.id || player2.id === socket.id) {
    chat.style.display = "none";
    const div = document.createElement("div");
    div.innerHTML = ` <h1>Battleship</h1>
    <h2 id="statusText"></h2>
    <div id="grid"></div>
    <button id="interactionBtn">Start Game</button>`;
    document.body.appendChild(div);
  }
  players.push(player1);
  players.push(player2);

  // load scripts
  // ship.js runs first because of async=false
  loadScript("./../game/ship.js");
  loadScript("./../game/grid.js");
  loadScript("./../game/player.js");
  loadScript("./../game/main.js");
}

function loadScript(src) {
  let script = document.createElement("script");
  script.src = src;
  script.async = false;
  document.body.append(script);
}
