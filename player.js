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

  placeShipMarker(cellIndex, type, shipCell) {
    console.log("placeShipMarker", cellIndex, type, shipCell);
    console.log(this.ships.ships[type].type);
    console.log(this.ships.ships[type].cells[shipCell]);
    console.log("shiptype num of cells: ");
    console.log(this.ships.ships[type].cells.length - shipCell - 1);
    const shipTypeName = this.ships.ships[type].type;
    const shipCellLength = this.ships.ships[type].cells.length;
    const imageNumber = this.ships.ships[type].cells.length - shipCell;
    let firstCellIndex;
    console.log("imageNumber: ", imageNumber);
    console.log("shipcelllength: ", shipCellLength);
    // image rotation is decided by the ships placement direction
    const imageRotation = this.ships.ships[type].isVertical ? "vertical" : "horizontal";
    console.log(imageRotation);
    // imageRotation is decided on the second placement
    // So index 0 is always rotated horizontal ,so if index 1 is decided vertical we need to go back
    // and change index 0 to be rotated vertical
    if (imageRotation === "vertical" && imageNumber === 2) {
      firstCellIndex = this.ships.ships[type].cells[shipCellLength - 1];
      console.log(this.ships.ships[type]);
      console.log("type: ", type);
      console.log("firstcellindex:", firstCellIndex);
      this.placeShipMarker(firstCellIndex, type, shipCellLength - 1);
    }
    const urlString = `url(/images/${shipTypeName}_0${imageNumber}.png)`;
    console.log(urlString);
    this.markings[cellIndex] = type;
    this.grid.gridElement.children[this.playerId].children[cellIndex].setAttribute(
      "class",
      `shipPlacement ${imageRotation}`
    );
    this.grid.gridElement.children[this.playerId].children[cellIndex].style.backgroundImage =
      urlString;
  }

  displayShipSankedMarker(shipIndexes, shipNum) {
    const activeShip = this.ships.ships[shipNum];
    const shipTypeName = activeShip.type;
    // image rotation is decided by the ships placement direction
    const imageRotation = activeShip.isVertical ? "vertical" : "horizontal";
    console.log(imageRotation);
    console.log("vert?", activeShip.isVertical);
    console.log("horizont?", activeShip.isHorizontal);
    // on each index of the ship set a class on the grid
    for (let i = 0; i < shipIndexes.length; i++) {
      console.log("shipCell?", i);
      this.placeShipMarker(shipIndexes[i], shipNum, i);
      /* console.log(i, shipIndexes[i], activeShip, imageRotation, shipTypeName);
      // find out if startindex, then add startimage
      if (i === 0) {
        console.log("found startindex");
        this.grid.gridElement.children[this.playerId].children[shipIndexes[i]].setAttribute(
          "class",
          `sanked startimage ${imageRotation}`
        );
      }
      // find out if endindex, then add the endimage
      else if (i === shipIndexes.length - 1) {
        console.log("found endindex");
        this.grid.gridElement.children[this.playerId].children[shipIndexes[i]].setAttribute(
          "class",
          `sanked endimage ${imageRotation}`
        );
      } else {
        // if none of above it's middleimage
        this.grid.gridElement.children[this.playerId].children[shipIndexes[i]].setAttribute(
          "class",
          `sanked middleimage ${imageRotation}`
        );
      } */
    }
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
        if (this.isVerticalAdjacent(cellIndex, cells) && activeShip.isHorizontal === false) {
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
        if (activeShip.isVertical && this.isVerticalAdjacent(cellIndex, cells)) {
          console.log("valid vertical placement");
        } else if (activeShip.isHorizontal && this.isHorizontalAdjacent(cellIndex, cells)) {
          console.log("valid horizontal placement");
        } else {
          console.log("not a valid placement");
          // not a valid placement
          return;
        }
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
