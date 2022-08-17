class Player {
  constructor(name, ships, grid, id) {
    this.playerId = id;
    this.name = name;
    this.grid = grid;
    this.ships = ships;
    this.shipNumber = 0;
    this.shipCells = ships.getShipCells()[this.shipNumber].length - 1;
    this.markings = new Array(100);
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

  displayShipSankedMarker(shipIndexes) {
    shipIndexes.forEach((index) =>
      this.grid.gridElement.children[this.playerId].children[index].setAttribute("class", "sanked")
    );
  }

  placeShip(cellIndex) {
    const cells = this.ships.getShipCells()[this.shipNumber];

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

        return;
      }
    }

    this.ships.setShipCell(this.shipNumber, this.shipCells, cellIndex);
    this.placeMarker(cellIndex, "shipPlacement");

    if (this.shipCells === 0) {
      this.shipNumber++;
      if (this.shipNumber === 5) {
        if (this.name === "player2") {
          // shipPlacement is complete

          statusText.textContent = `Ship placement complete!`;
          game?.newPhase("shipPlacement_completed");
          return;
        } else {
          // first player is finished placing ships
          game?.changePlayer();
          return;
        }
      }

      statusText.textContent = `${this.name}'s turn to place ${
        this.ships.ships[this.shipNumber].type
      }`;
      this.shipCells = this.ships.ships[this.shipNumber].cells.length;
    }
    this.shipCells--;
  }

  isVerticalAdjacent(cellIndex, cells) {
    const adjacentUpCell = parseInt(cells[this.shipCells + 1]) - 10;
    const adjacentDownCell = parseInt(cells[this.shipCells + 1]) + 10;

    if (parseInt(cellIndex) === adjacentUpCell || parseInt(cellIndex) === adjacentDownCell) {
      console.log("vertical placement detected");
      return true;
    } else {
      console.log("horizontal placement detected");
      return false;
    }
  }
  isHorizontalAdjacent(cellIndex, cells) {
    const adjacentLeftCell = parseInt(cells[this.shipCells + 1]) - 1;
    const adjacentRightCell = parseInt(cells[this.shipCells + 1]) + 1;

    if (parseInt(cellIndex) === adjacentLeftCell || parseInt(cellIndex) === adjacentRightCell) {
      console.log("horizontal is verified ");
      return true;
    } else {
      return false;
    }
  }

  isNotFirstCell() {
    return this.shipCells !== this.ships.getShipCells()[this.shipNumber].length - 1;
  }
}
