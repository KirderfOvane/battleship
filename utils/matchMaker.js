const { getRoomUsers, getCurrentUser } = require("./users");

let gameQueue = [];

function addUserToGameQueue(userId) {
  gameQueue.push(userId);
}
function removeUserFromGameQueue(userId) {
  const tempArr = [];
  for (let i = 0; i < gameQueue.length; i++) {
    if (gameQueue[i] !== userId) {
      tempArr.push(gameQueue[i]);
    }
  }
  gameQueue = tempArr;

  return;
}

function findGame(userId) {
  const users = getRoomUsers("lobby");
  const potentialGameOpponents = users.filter(
    (user) => user.id !== userId && gameQueue.filter((id) => id !== userId.toString())
  );
  if (potentialGameOpponents.length > 0 && gameQueue.length > 0) {
    let match = false;
    for (let i = 0; i < gameQueue.length; i++) {
      if (gameQueue[i] !== userId) {
        for (let j = 0; j < potentialGameOpponents.length; j++) {
          if (potentialGameOpponents[j].id === gameQueue[i]) {
            match = gameQueue[i];
          }
        }
      }
    }

    if (match) {
      removeUserFromGameQueue(userId);
      removeUserFromGameQueue(match);
      return getCurrentUser(match);
    } else {
      return match;
    }
  } else {
    addUserToGameQueue(userId);

    return false;
  }
}

module.exports = { findGame };
