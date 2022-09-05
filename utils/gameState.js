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
  if (playerId === 0) {
    gameState[playerId][key] = value;
  } else {
    gameState[playerId][key] = value;
  }
}

function getGameState() {
  return gameState;
}

function isBothPlayersFinishedWithShipPlacement() {
  return gameState[0].ships && gameState[1].ships;
}

function isBothPlayersReadyForGamePlay() {
  return gameState[0].gameplay && gameState[1].gameplay;
}

module.exports = {
  isBothPlayersFinishedWithShipPlacement,
  getGameState,

  setGameState,
  isBothPlayersReadyForGamePlay,
};
