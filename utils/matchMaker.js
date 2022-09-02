const { getRoomUsers, getCurrentUser } = require("./users");

let gameQueue = [];

function addUserToGameQueue(userId) {
  gameQueue.push(userId);
  // console.log("added user to queue", gameQueue);
}
function removeUserFromGameQueue(userId) {
  // console.log("queue before removal of id:", userId, gameQueue);

  const tempArr = [];
  for (let i = 0; i < gameQueue.length; i++) {
    if (gameQueue[i] !== userId) {
      tempArr.push(gameQueue[i]);
    }
  }
  gameQueue = tempArr;
  //  console.log("queue after removed user ", tempArr);
  return;
}

function findGame(userId) {
  const users = getRoomUsers("lobby");
  const potentialGameOpponents = users.filter(
    (user) => user.id !== userId && gameQueue.filter((id) => id !== userId.toString())
  );
  if (potentialGameOpponents.length > 0 && gameQueue.length > 0) {
    // console.log("found potentialOpponents", potentialGameOpponents);
    //  console.log("queue", gameQueue);
    let match = false;
    for (let i = 0; i < gameQueue.length; i++) {
      //    console.log(gameQueue[i], userId, potentialGameOpponents.includes(gameQueue[i]));
      if (gameQueue[i] !== userId) {
        // console.log("first in queue:", gameQueue[i], "is not user:", userId);
        for (let j = 0; j < potentialGameOpponents.length; j++) {
          if (potentialGameOpponents[j].id === gameQueue[i]) {
            //     console.log("found match");
            // console.log(gameQueue[i]);
            match = gameQueue[i];
          }
        }
      }
    }

    //   console.log("match", match);
    if (match) {
      // console.log("removing from queue", userId, match);
      removeUserFromGameQueue(userId);
      removeUserFromGameQueue(match);
      return getCurrentUser(match);
    } else {
      return match;
    }
  } else {
    addUserToGameQueue(userId);
    //  console.log("no users in queue, show waitingmode to user");
    //  console.log("gameQueue:", gameQueue);
    return false;
  }
}

module.exports = { findGame };
