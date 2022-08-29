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
  if (potentialGameOpponents.length > 0 && gameQueue.length > 0) {
    console.log("found potentialOpponents", potentialGameOpponents);
    console.log("queue", gameQueue);
    let match = false;
    for (let i = 0; i < gameQueue.length; i++) {
      console.log(gameQueue[i], userId, potentialGameOpponents.includes(gameQueue[i]));
      if (gameQueue[i] !== userId) {
        for (let j = 0; j < potentialGameOpponents.length; j++) {
          if (potentialGameOpponents[j].id === gameQueue[i]) {
            console.log("found match");
            console.log(gameQueue[i]);
            match = gameQueue[i];
          }
        }
      }
    }

    console.log("match", match);
    if (match) {
      console.log("entry");
      removeUserFromGameQueue(userId);
      removeUserFromGameQueue(match);
      return getCurrentUser(match);
    } else {
      return match;
    }
  } else {
    addUserToGameQueue(userId);
    console.log("no users in queue, show waitingmode to user");
    console.log("gameQueue:", gameQueue);
    return false;
  }
}

module.exports = { findGame };
