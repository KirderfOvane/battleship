const grid = document.getElementById("grid");
const statusText = document.getElementById("statusText");
const btn = document.getElementById("interactionBtn");

const cellSize = [50, 50];
const gridSize = [500, 500];
const gridNotation = [
  ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
];

class initializeGame {
  constructor(grid, button, player1, player2) {
    this.phase = "init";
    this.grid1 = new Grid(gridSize, cellSize, grid, "player1-grid", gridNotation);
    this.player1 = new Player(player1.username, new Ships("player1"), this.grid1, 0);
    this.grid2 = new Grid(gridSize, cellSize, grid, "player2-grid", gridNotation);
    this.player2 = new Player(player2.username, new Ships("player2"), this.grid2, 1);
    this.button = button;
    this.currentPlayerId = 1;
    if (this.phase === "init") this.startShipPlacement();
  }

  newPhase(phase) {
    switch (phase) {
      case "shipPlacement":
        this.startShipPlacement();
        break;
      case "shipPlacement_completed":
        this.startGamePlayPrompt();
        break;
      case "gameplay":
        this.startGamePhase();
        break;
      case "end":
        this.endGame();
        break;
      case "init":
        this.startShipPlacement();
        break;
    }
  }

  startShipPlacement() {
    this.phase = "shipPlacement";

    // hide all grids and display button
    grid.style.display = "none";
    this.displayButtonWithText("Start placing ships");

    this.button.addEventListener("click", this.#buttonPressed);
  }
  displayButtonWithText(text) {
    this.button.style.display = "inline-block";
    this.button.textContent = text;
  }

  // note the arrow-function to get access to this.
  #buttonPressed = (event) => {
    if (this.phase === "shipPlacement") {
      if (socket.id === players[0].id) {
        // draw for player1

        this.player1.grid.draw(this.player1.grid.gridElement);
        this.player1.grid.gridElement.style.display = "grid";

        const activeShipType = this.player1.ships.ships[this.player1.shipNumber].type;
        statusText.textContent = `${this.player1.name}'s turn to place ${activeShipType}`;
        // hide button
        this.button.style.display = "none";
        return;
      } else {
        // draw for player2
        this.player2.grid.draw(this.player2.grid.gridElement);
        this.player2.grid.gridElement.style.display = "grid";

        const activeShipType = this.player2.ships.ships[this.player2.shipNumber].type;
        statusText.textContent = `${this.player2.name}'s turn to place ${activeShipType}`;
        // hide button
        this.button.style.display = "none";
        return;
      }
    }
    if (this.phase === "shipPlacement_completed") {
      if (socket.id === players[0].id) {
        this.button.style.display = "none";
        socket.emit("startGamePlay", { playerId: 0 });
        return;
      } else {
        this.button.style.display = "none";
        socket.emit("startGamePlay", { playerId: 1 });
        return;
      }
    }

    if (this.phase === "gameplay") {
      socket.emit("endTurn");
    }

    if (this.phase === "end") {
      this.exitGame();
    }
    if (this.phase === "init") {
      this.newPhase("init");
    }
  };

  startGamePlayPrompt() {
    this.phase = "shipPlacement_completed";
    grid.style.display = "none";
    this.button.style.display = "inline-block";
    this.button.textContent = "Start the game";
  }

  startGamePhase() {
    this.phase = "gameplay";
    socket.id === players[0].id && this.player1.resetMarkers();
    socket.id === players[1].id && this.player2.resetMarkers();
    this.changePlayer();
  }

  endGame() {
    this.phase = "end";
    this.displayButtonWithText("Exit to Game Lobby");
  }

  exitGame() {
    if (socket.id === players[0].id) {
      socket.emit("exitGame", { user: players[0], room: "lobby" });
      this.displayExitGame(players[0]);
    }
    if (socket.id === players[1].id) {
      socket.emit("exitGame", { user: players[1], room: "lobby" });
      this.displayExitGame(players[1]);
    }
  }

  displayExitGame(player) {
    console.log(player, "exiting game");
    // display game
    if (player.id === socket.id) {
      chat.style.display = "block";
      const gameDiv = document.getElementById("game");
      gameDiv.style.display = "none";
    }
    players.filter((p) => p.id === player.id);
    console.log("player left:", players);
  }

  checkWinCondition(opponentsShips) {
    let shipSankedCount = opponentsShips.length;
    for (let i = 0; i < opponentsShips.length; i++) {
      if (opponentsShips[i].cells.length === opponentsShips[i].hits.length) {
        shipSankedCount--;
        if (shipSankedCount < 1) {
          return true;
        }
      }
    }
    return false;
  }

  changePlayer() {
    //  console.log(this.currentPlayer);
    if (this.currentPlayerId === 0) {
      // console.log("player1 is current player,switching");
      this.currentPlayerId = 1;
    } else {
      //   console.log("player2 is current player,switching..");
      this.currentPlayerId = 0;
    }
    //  console.log("currentplayer:", players[this.currentPlayerId]);
    let playerName;
    if (socket.id === players[this.currentPlayerId].id) {
      this.button.style.display = "inline-block";
      this.button.textContent = "Continue";
      statusText.textContent = "Your turn!";
      playerName = `player${(parseInt(this.currentPlayerId) + 1).toString()}`;
      game[playerName].grid.draw(game[playerName].grid.gridElement);
      console.log(game[playerName].grid.playerClicked);
      game[playerName].grid.playerClicked = false;
    } else {
      this.button.style.display = "none";
      statusText.textContent = `Waiting for ${
        players[this.currentPlayerId].username
      } to finish it turn`;
    }
  }
}

socket.on("phase", (object) => {
  if (object.phase === "shipPlacement_completed") {
    console.log(object.gameState);
    if (socket.id === players[0].id) {
      console.log("updating player1 socket");
      console.log("ships before:", game.player2.ships);
      console.log("new ships from state:", object.gameState[1].ships);
      game.player2.ships.replaceAllShipData(object.gameState[1].ships);

      console.log("player2 ships after:", game.player2.ships);
    } else {
      console.log("updating player2 socket");
      console.log("ships before:", game.player1.ships.getShipCells());

      game.player1.ships.replaceAllShipData(object.gameState[0].ships);
      //game.player1.ships.replaceAllShipCells(object.gameState[0].ships);
      console.log("player1 ships after:", game.player1.ships);
    }
  }
  game.newPhase(object.phase);
});

socket.on("changePlayer", () => {
  console.log(socket.id, "detected changePlayer");
  game.changePlayer();
});

socket.on("displayGameOver", (winnerName) => {
  console.log("winner:", winnerName);
  statusText.textContent = `${winnerName} won!`;
  game?.newPhase("end");
  grid.style.display = "none";
});

const game = new initializeGame(grid, btn, players[0], players[1]);
