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
      this.changePlayer();
    }

    if (this.phase === "end") {
      this.resetGame();
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
    this.displayButtonWithText("Restart Game");
  }

  resetGame() {
    this.phase = "init";
    // reset ships,cells, hits & markings
    this.player1.resetMarkers();
    this.player2.resetMarkers();
    socket.id === players[0].id && this.player1.ships.initShips();
    socket.id === players[0].id && this.player1.resetShip();

    socket.id === players[1].id && this.player2.initShips();
    socket.id === players[1].id && this.player2.resetShip();
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
      /*  console.log(game[playerName]);
      console.log(game[playerName].grid);
      console.log(game[playerName].grid.gridElement);
      console.log(game[playerName].grid.draw(game[playerName].grid.gridElement)); */
      game[playerName].grid.draw(game[playerName].grid.gridElement);
    } else {
      this.button.style.display = "none";
      statusText.textContent = `Waiting for ${
        players[this.currentPlayerId].username
      } to finish it turn`;
    }
  }
}

socket.on("phase", (phase) => {
  game.newPhase(phase);
});

const game = new initializeGame(grid, btn, players[0], players[1]);
