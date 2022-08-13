const grid = document.getElementById("grid");
const statusText = document.getElementById("statusText");

const cellSize = [50, 50];
const gridSize = [500, 500];
const gridNotation = [
  ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
];
const carrier = { type: "carrier", cells: ["0", "0", "0", "0", "0"] };
const battleship = { type: "battleship", cells: ["0", "0", "0", "0"] };
const cruiser = { type: "cruiser", cells: ["0", "0", "0"] };
const submarine = { type: "submarine", cells: ["0", "0", "0"] };
const destroyer = { type: "destroyer", cells: ["0", "0"] };
const ships = [carrier, battleship, cruiser, submarine, destroyer];

class initializeGame {
  constructor(grid) {
    this.phase = "init";
    this.grid1 = new Grid(gridSize, cellSize, grid, "player1-grid");
    this.player1 = new Player("player1", ships, this.grid1, 0);
    this.grid2 = new Grid(gridSize, cellSize, grid, "player2-grid");
    this.player2 = new Player("player2", ships, this.grid2, 1);
    this.currentPlayer = this.player1;
    if (this.phase === "init") this.startShipPlacementPhase();
  }

  startShipPlacementPhase() {
    this.phase = "shipPlacement";
    // console.log(this.currentPlayer.grid.gridElement);
    this.currentPlayer.grid.draw(this.currentPlayer.grid.gridElement);
    statusText.textContent = `${this.currentPlayer.name}'s turn to place ${
      ships[this.currentPlayer.shipNumber].type
    }`;
    //this.currentPlayer.placeShip(ships[this.currentPlayer.shipNumber]);
  }

  startGamePhase() {
    this.phase = "gameplay";
    console.log(this.currentPlayer.name + " turn");
    console.log(this.currentPlayer.ships);
    statusText.textContent = `${this.currentPlayer.name}'s turn`;
  }
  restartGame() {}
  checkWinCondition() {}
  changePlayer() {
    console.log("changeplayertime");
    if (this.currentPlayer === this.player1) {
      this.currentPlayer = this.player2;
      this.currentPlayer.grid.draw(this.currentPlayer.grid.gridElement);
    } else {
      this.currentPlayer = this.player1;
      this.currentPlayer.grid.draw(this.currentPlayer.grid.gridElement);
    }
    statusText.textContent = `${this.currentPlayer.name}'s turn`;
  }
}

const game = new initializeGame(grid);
//game.startShipPlacementPhase();
