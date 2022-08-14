class Player {
  constructor(name, ships, grid, id) {
    this.playerId = id;
    this.name = name;
    this.grid = grid;
    this.ships = ships;
    this.shipNumber = 0;
    this.shipCells = ships[this.shipNumber].cells.length - 1;
    this.markings = new Array(100);
  }
  isHit(cellIndex) {
    let hit = false;

    const scanShips = ships.map((ship) =>
      ship.cells.filter((cell) => cell.toString() === cellIndex)
    );
    scanShips.forEach((ship) => {
      if (ship.length > 0) {
        hit = true;
      }
    });
    return hit;
  }

  resetMarkers() {
    console.log("resetting markers");
    this.markings = new Array(100);
    for (let i = 0; i < 100; i++) {
      this.grid.gridElement.children[this.playerId].children[i].setAttribute("class", "empty");
    }
  }

  placeMarker(cellIndex, type) {
    this.markings[cellIndex] = type;
    this.grid.gridElement.children[this.playerId].children[cellIndex].setAttribute("class", type);
  }
  checkShipSinked() {}

  placeShip(cellIndex) {
    const cells = this.ships[this.shipNumber].cells;
    let shipDirection = "";

    // logic that verifies cellIndex is adjacent to rest of indexes. After second
    // cellIndex in one ship the direction of the ship is also decided and all other indexes in
    // the other direction should be scrapped.
    if (this.isNotFirstCell()) {
      if (this.isVerticalAdjacent(cellIndex, cells)) {
        shipDirection = "vertical";
      } else if (this.isHorizontalAdjacent(cellIndex, cells)) {
        shipDirection = "horizontal";
      } else {
        // not a valid placement
        console.log("not a valid cell placement");
        return;
      }
    }

    this.ships[this.shipNumber].cells[this.shipCells] = cellIndex;
    this.placeMarker(cellIndex, "shipPlacement");

    if (this.shipCells === 0) {
      this.shipNumber++;
      if (this.shipNumber === 5) {
        if (this.name === "player2") {
          console.log("shipPlacement complete");

          statusText.textContent = `Ship placement complete!`;
          game?.newPhase("shipPlacement_completed");
          return;
        } else {
          console.log("first player finished");
          game?.changePlayer();
          return;
        }
      }

      statusText.textContent = `${this.name}'s turn to place ${this.ships[this.shipNumber].type}`;
      this.shipCells = ships[this.shipNumber].cells.length;
    }
    this.shipCells--;
  }

  isVerticalAdjacent(cellIndex, cells) {
    const adjacentUpCell = parseInt(cells[this.shipCells + 1]) - 10;
    const adjacentDownCell = parseInt(cells[this.shipCells + 1]) + 10;

    if (parseInt(cellIndex) === adjacentUpCell || parseInt(cellIndex) === adjacentDownCell) {
      console.log("vert is true man");
      return true;
    } else {
      console.log("vert is false man");
      return false;
    }
  }
  isHorizontalAdjacent(cellIndex, cells) {
    const adjacentLeftCell = parseInt(cells[this.shipCells + 1]) - 1;
    const adjacentRightCell = parseInt(cells[this.shipCells + 1]) + 1;

    if (parseInt(cellIndex) === adjacentLeftCell || parseInt(cellIndex) === adjacentRightCell) {
      console.log("horizontal is true man");
      return true;
    } else {
      console.log("horizontal is false man");
      return false;
    }
  }

  isNotFirstCell() {
    return this.shipCells !== ships[this.shipNumber].cells.length - 1;
  }
}
