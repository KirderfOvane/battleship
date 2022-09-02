const gameState = [
  {
    player1: {
      ships: null,
      gameplay: false,
    },
  },
  {
    player2: {
      ships: null,
      gameplay: false,
    },
  },
];

function setGameState(playerId, key, value) {
  console.log(playerId, key, value);
  if (playerId === 0) {
    console.log("old value", gameState[playerId][key]);
    gameState[playerId][key] = value;
    console.log("new value", gameState[playerId][key]);
  } else {
    console.log("old value", gameState[playerId][key]);
    gameState[playerId][key] = value;
    console.log("new value", gameState[playerId][key]);
  }
}

function getGameState() {
  console.log(gameState);
}

function getPlayerGameState(playerId) {
  if (playerId === 0) {
    console.log(gameState[playerId]);
  } else {
    console.log(gameState[playerId]);
  }
}

function isBothPlayersFinishedWithShipPlacement() {
  console.log(gameState[0].ships, gameState[1].ships);
  return gameState[0].ships && gameState[1].ships;
}

function isBothPlayersReadyForGamePlay() {
  console.log(gameState[0].gameplay, gameState[1].gameplay);
  return gameState[0].gameplay && gameState[1].gameplay;
}

module.exports = {
  isBothPlayersFinishedWithShipPlacement,
  getGameState,
  getPlayerGameState,
  setGameState,
  isBothPlayersReadyForGamePlay,
};
