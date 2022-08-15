const grid = document.getElementById("grid");
const statusText = document.getElementById("statusText");
const btn = document.getElementById("interactionBtn");

const cellSize = [50, 50];
const gridSize = [500, 500];
const gridNotation = [
  ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
];
class Ships {
  constructor(owner) {
    this.owner = owner;
    this.carrier = { type: "carrier", cells: ["0", "0", "0", "0", "0"] };
    this.battleship = { type: "battleship", cells: ["0", "0", "0", "0"] };
    this.cruiser = { type: "cruiser", cells: ["0", "0", "0"] };
    this.submarine = { type: "submarine", cells: ["0", "0", "0"] };
    this.destroyer = { type: "destroyer", cells: ["0", "0"] };
    this.ships = [this.carrier, this.battleship, this.cruiser, this.submarine, this.destroyer];
  }
  getShipCells() {
    return this.ships.map((ship) => ship.cells);
  }
  setShipCell(shipNumber, cell, newValue) {
    this.ships[shipNumber].cells[cell] = newValue;
  }
  isShipHit(cellIndex) {
    let hit = false;
    const scanShips = this.ships.map((ship) =>
      ship.cells.filter((cell) => cell.toString() === cellIndex)
    );
    scanShips.forEach((ship) => {
      if (ship.length > 0) {
        hit = true;
      }
    });
    return hit;
  }
}

class initializeGame {
  constructor(grid, button) {
    this.phase = "init";
    this.grid1 = new Grid(gridSize, cellSize, grid, "player1-grid");
    this.player1 = new Player("player1", new Ships("player1"), this.grid1, 0);
    this.grid2 = new Grid(gridSize, cellSize, grid, "player2-grid");
    this.player2 = new Player("player2", new Ships("player2"), this.grid2, 1);
    this.currentPlayer = this.player1;
    this.button = button;
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
      this.currentPlayer.grid.draw(this.currentPlayer.grid.gridElement);
      this.currentPlayer.grid.gridElement.style.display = "grid";

      const activeShipType = this.currentPlayer.ships.ships[this.currentPlayer.shipNumber].type;
      statusText.textContent = `${this.currentPlayer.name}'s turn to place ${activeShipType}`;
      // hide button
      this.button.style.display = "none";
      return;
    }
    if (this.phase === "shipPlacement_completed") {
      this.button.style.display = "none";
      this.newPhase("gameplay");
      return;
    }

    if (this.phase === "gameplay") {
      this.changePlayer();
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
    this.player1.resetMarkers();
    this.player2.resetMarkers();
    this.changePlayer();
  }

  endGame() {
    this.phase = "init";
    this.button.removeEventListener("click", this.buttonPressed);
  }
  restartGame() {}
  checkWinCondition() {}
  changePlayer() {
    console.log("changeplayertime");
    if (this.currentPlayer === this.player1) {
      this.currentPlayer = this.player2;
      this.currentPlayer.grid.draw(this.currentPlayer.grid.gridElement);
      grid.style.display = "grid";
    } else {
      this.currentPlayer = this.player1;
      this.currentPlayer.grid.draw(this.currentPlayer.grid.gridElement);
      grid.style.display = "grid";
    }
    statusText.textContent = `${this.currentPlayer.name}'s turn`;
  }
}

const game = new initializeGame(grid, btn);
