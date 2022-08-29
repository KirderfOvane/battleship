const { getRoomUsers, getCurrentUser } = require("./users");

const gameQueue = [];

function addUserToGameQueue(userId) {
  gameQueue.push(userId);
  console.log("added user to queue", gameQueue);
}
function removeUserFromGameQueue(userId) {
  gameQueue.filter((id) => id === userId);
  console.log("removed user from queue", gameQueue);
}

function findGame(userId) {
  const users = getRoomUsers("lobby");
  const potentialGameOpponents = users.filter(
    (user) => user.id !== userId && gameQueue.filter((id) => id !== userId)
  );
  if (potentialGameOpponents.length > 0) {
    console.log("found potentialOpponents", potentialGameOpponents);
    // matching with the player that has waited the longest:
    const match = potentialGameOpponents.filter((u) => u.id === gameQueue[0] && u.id !== userId);
    const you = getCurrentUser(userId);
    console.log("MATCH:", match, "against you:", you.username);
    console.log("STARTING GAME");
    startGame(you, match);
  } else {
    addUserToGameQueue(userId);
  }
}

module.exports = { findGame };
