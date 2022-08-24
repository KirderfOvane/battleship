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
      this.grid.gridElement.children[this.playerId].children[i].style.backgroundImage = "unset";
    }
  }

  resetShip() {
    this.shipNumber = 0;
    this.shipCells = this.ships.getShipCells()[this.shipNumber].length - 1;
  }

  placeHitMarker(cellIndex) {
    this.grid.gridElement.children[this.playerId].children[cellIndex].setAttribute("class", `hit`);
  }
  placeMissMarker(cellIndex) {
    this.grid.gridElement.children[this.playerId].children[cellIndex].setAttribute("class", `miss`);
  }
  isRotationChanged(imageRotation, imageNumber) {
    return imageRotation === "vertical" && imageNumber === 2;
  }

  adjustFirstShipCellRotation(ship, type, shipCellLength) {
    console.log("ADJUSTFIRSTSHIPCELLROTATION: ", ship, type, shipCellLength);
    // imageRotation is decided on the second placement
    // So index 0 is always rotated horizontal ,so if index 1 is decided vertical we need to go back
    // and change index 0 to be rotated vertical
    let firstCellIndex;
    firstCellIndex = ship.cells[shipCellLength - 1];

    this.placeShipMarker(firstCellIndex, type, shipCellLength - 1);
  }

  placeShipMarker(cellIndex, type, shipCell) {
    const shipTypeName = this.ships.ships[type].type;
    const shipCellLength = this.ships.ships[type].cells.length;
    const imageNumber = this.ships.ships[type].cells.length - shipCell;

    // image rotation is decided by the ships placement direction
    let imageRotation;
    if (game?.phase === "shipPlacement") {
      imageRotation = this.ships.ships[type].isVertical ? "vertical" : "horizontal";

      this.isRotationChanged(imageRotation, imageNumber) &&
        this.adjustFirstShipCellRotation(this.ships.ships[type], type, shipCellLength);
    } else {
      // phase is gameplay,so should lookup enemy ships position.
      const opponent = this.name === "player1" ? "player2" : "player1";
      const opponentShip = game[opponent].ships.ships[type];

      imageRotation = opponentShip.isVertical ? "vertical" : "horizontal";

      this.isRotationChanged(imageRotation, imageNumber) &&
        this.adjustFirstShipCellRotation(opponentShip, type, shipCellLength);
    }

    const urlString = `url(/images/${shipTypeName}_0${imageNumber}.png)`;

    this.markings[cellIndex] = type;
    this.grid.gridElement.children[this.playerId].children[cellIndex].setAttribute(
      "class",
      `shipPlacement ${imageRotation}`
    );
    this.grid.gridElement.children[this.playerId].children[cellIndex].style.backgroundImage =
      urlString;
  }

  displayShipSankedMarker(shipIndexes, shipNum) {
    // on each index of the ship placeShipMarker
    for (let i = 0; i < shipIndexes.length; i++) {
      this.placeShipMarker(shipIndexes[i], shipNum, i);
    }
  }

  #isColliding(cellIndex, activeShip) {
    //console.log(activeShip.cells);
    // startingPoint for extrapolation
    const startingPoint = activeShip.cells[activeShip.cells.length - 1];

    for (let i = activeShip.cells.length - 2; i >= 0; i--) {
      //console.log(i);
      if (activeShip.isVertical) {
        if (this.isVerticalUp) {
          console.log(cellIndex - 10);
        }
      }
    }
    // console.log("cells to verify:", activeShip.cells);
    // console.log(activeShip, cellIndex);
    return false;
  }

  placeShip(cellIndex) {
    const cells = this.ships.getShipCells()[this.shipNumber];
    const activeShip = this.ships.ships[this.shipNumber];

    // Gaurd logic that verifies cellIndex is adjacent to rest of indexes. After second
    // cellIndex in one ship the direction of the ship is also decided and all other indexes in
    // the other direction should be scrapped.
    if (this.isNotFirstCell()) {
      // if both isvertical and ishorizontal is false , then it's the second placement and we
      // need to decide an placement direction
      if (!activeShip.isVertical && !activeShip.isHorizontal) {
        if (
          this.isVerticalUp(cellIndex, cells) ||
          (this.isVerticalDown(cellIndex, cells) && activeShip.isHorizontal === false)
        ) {
          activeShip.isVertical = true;
        } else if (this.isHorizontalAdjacent(cellIndex, cells) && activeShip.isVertical === false) {
          activeShip.isHorizontal = true;
        } else {
          // not a valid placement
          console.log("not valid");
          return;
        }
      } else {
        // this is the third cell or more placed.
        // Make sure the new clicked cell is vertical if this.ships.isVertical
        // or make sure the new clicked cell is horizontal if this.ships.isHorizontal
        if (
          (activeShip.isVertical && this.isVerticalUp(cellIndex, cells)) ||
          this.isVerticalDown(cellIndex, cells)
        ) {
          console.log("valid vertical placement");
        } else if (activeShip.isHorizontal && this.isHorizontalAdjacent(cellIndex, cells)) {
          console.log("valid horizontal placement");
        } else {
          console.log("not a valid placement");
          // not a valid placement
          return;
        }
      }

      // Gaurd logic that verifies this placement won't cross another ships placement
      // uses isVertical and isHorizontal for direction
      if (this.#isColliding(cellIndex, activeShip)) {
        console.log("collision detected, aborting..");

        return;
      }
    }

    this.ships.setShipCell(this.shipNumber, this.shipCells, cellIndex);
    this.placeShipMarker(cellIndex, this.shipNumber, this.shipCells);

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

  isVerticalUp(cellIndex, cells) {
    const adjacentUpCell = parseInt(cells[this.shipCells + 1]) - 10;

    if (parseInt(cellIndex) === adjacentUpCell) {
      console.log("vertical placement detected");
      return true;
    } else {
      console.log("horizontal placement detected");
      return false;
    }
  }
  isVerticalDown(cellIndex, cells) {
    const adjacentDownCell = parseInt(cells[this.shipCells + 1]) + 10;
    if (parseInt(cellIndex) === adjacentDownCell) {
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
