const socket = io();

// receive message from server
socket.on("message", (message) => {
  console.log(message);
});
