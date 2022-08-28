class Player {
  constructor(name, ships, grid, id) {
    this.playerId = id;
    this.name = name;
    this.grid = grid;
    this.ships = ships;
    this.shipNumber = 0;
    this.shipCells = ships.getShipCells()[this.shipNumber].length - 1;
    this.markings = {};
    this.possibilityMarkings = [];
    this.possibilities = [];
  }

  resetMarkers() {
    this.markings = {};
    for (let i = 0; i < 100; i++) {
      this.grid.gridElement.children[this.playerId].children[i].setAttribute("class", "empty");
      this.grid.gridElement.children[this.playerId].children[i].style.backgroundImage = "unset";
    }
  }
  getMarking(index) {
    return this.markings[index.toString()];
  }
  setMarking(index, value) {
    this.markings[index.toString()] = value;
  }
  resetShip() {
    this.shipNumber = 0;
    this.shipCells = this.ships.getShipCells()[this.shipNumber].length - 1;
  }

  placeHitMarker(cellIndex) {
    this.setMarking(cellIndex, "hit");

    this.getGameGridCells()[cellIndex].setAttribute("class", `hit`);
  }
  placeMissMarker(cellIndex) {
    this.setMarking(cellIndex, "miss");
    this.getGameGridCells()[cellIndex].setAttribute("class", `miss`);
  }

  adjustFirstShipCellRotation(ship, type, shipCellLength) {
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
      imageRotation = this.ships.ships[type].direction;
      imageNumber === 2 &&
        this.adjustFirstShipCellRotation(this.ships.ships[type], type, shipCellLength);
    } else {
      // phase is gameplay,so should lookup enemy ships position.
      const opponent = this.name === "player1" ? "player2" : "player1";
      const opponentShip = game[opponent].ships.ships[type];

      imageRotation = opponentShip.direction;

      imageNumber === 2 && this.adjustFirstShipCellRotation(opponentShip, type, shipCellLength);
    }

    const urlString = `url(/images/${shipTypeName}_0${imageNumber}.png)`;

    this.setMarking(cellIndex, "x");
    const gameGridCells = this.getGameGridCells();

    gameGridCells[cellIndex].setAttribute("class", `shipPlacement ${imageRotation}`);
    gameGridCells[cellIndex].style.backgroundImage = urlString;
  }

  getGameGridCells() {
    const allGridCells = this.grid.gridElement.children[this.playerId];
    const gameGridCells = [];
    for (let i = 0; i < allGridCells.children.length; i++) {
      if (allGridCells.children[i].getAttribute("cellIndex")) {
        gameGridCells.push(allGridCells.children[i]);
      }
    }
    return gameGridCells;
  }

  displayShipSankedMarker(shipIndexes, shipNum) {
    // on each index of the ship placeShipMarker
    for (let i = 0; i < shipIndexes.length; i++) {
      this.placeShipMarker(shipIndexes[i], shipNum, i);
    }
  }

  #extrapolate(gridValue, direction) {
    let extrapolatedNumber;
    switch (direction) {
      case "up":
        extrapolatedNumber = gridValue - 10;
        break;
      case "down":
        extrapolatedNumber = gridValue + 10;
        break;
      case "left":
        extrapolatedNumber = gridValue - 1;
        break;
      case "right":
        extrapolatedNumber = gridValue + 1;
        break;
      case "":
        console.log("ERROR in EXTRAPOLATION");
        break;
    }

    if (extrapolatedNumber > 99) return false;
    if (extrapolatedNumber < 0) return false;
    return extrapolatedNumber.toString();
  }

  #isColliding(gridPoint) {
    let collision = false;
    const ShipCells = this.ships.getShipCells();

    for (let i = 0; i < ShipCells.length; i++) {
      if (ShipCells[i].includes(gridPoint.toString())) {
        collision = true;
        break;
      }
    }

    return collision;
  }

  #calculatePositions(cellIndex, activeShip, direction = activeShip.direction) {
    // check cellindex collisions before looping
    if (this.#isColliding(cellIndex.toString()) && this.isNotFirstCell()) return false;

    let extrapolatedGridPoint = null;
    let collision = false;
    let positions = [];
    let numCells = activeShip.cells.length - 1;

    // add cellIndex(click 2) cell to positions
    positions.push(cellIndex.toString());

    // special-case for destroyer
    if (0 > numCells) {
      numCells = 0;
    }

    for (let i = numCells; i > 0; i--) {
      if (!extrapolatedGridPoint) {
        extrapolatedGridPoint = this.#extrapolate(parseInt(cellIndex), direction);
      } else {
        extrapolatedGridPoint = this.#extrapolate(parseInt(extrapolatedGridPoint), direction);
      }
      // Beware: it is checking for false, but integer 0 also interprets as false.
      // So if extrapolatedGridPoint is not converted to string before it will take 0 as false.
      if (extrapolatedGridPoint === false) {
        console.log("FOUND OUT OF GRID-BOUNDS", direction);
        collision = true;
        return;
      }
      // Gaurd collision-check
      if (this.#isColliding(extrapolatedGridPoint.toString())) {
        collision = true;
        return;
      }

      positions.push(extrapolatedGridPoint);
    }
    // Gaurd: If collision is detected inside the loop, don't do bound-check, just abort.
    if (collision) return false;

    // Gaurd out of x bounds check
    if (direction === "left" || direction === "right") {
      const resultOfCheck = this.#isOutOfXbounds(
        activeShip.cells[activeShip.cells.length - 1],
        positions
      );

      if (resultOfCheck) collision = true;
    }

    return collision === false ? positions : false;
  }

  #isOutOfXbounds(shipCellOne, restOfShipCells) {
    let isOutOfXbounds = false;
    const xRanges = this.grid.getXgridBounds();

    for (let i = 1; i < xRanges.length; i++) {
      if (xRanges[i] > parseInt(shipCellOne)) {
        const test = restOfShipCells.filter((v) => v >= xRanges[i - 1] && v < xRanges[i]);

        if (test.length !== restOfShipCells.length) {
          console.log("Out of x-bounds!", restOfShipCells.length - test.length);
          isOutOfXbounds = true;
        }
        return isOutOfXbounds;
      } else {
        continue;
      }
    }

    return isOutOfXbounds;
  }

  placeShip(cellIndex) {
    const cells = this.ships.getShipCells()[this.shipNumber];
    const activeShip = this.ships.ships[this.shipNumber];

    // Gaurd logic that verifies cellIndex is adjacent to rest of indexes. After second
    // cellIndex in one ship the direction of the ship is also decided and all other indexes in
    // the other direction should be scrapped.
    if (this.isNotFirstCell()) {
      //  It's the second placement/click and we
      // can  decide an placement direction
      this.#setDirection(activeShip, cellIndex, cells);

      this.possibilityMarkings.forEach((mark) => {
        if (mark === cellIndex) {
          // removing from possibilitymarkers as clearpossibilityMarker-method will later
          // otherwise override the image with class empty instead
          this.#removePossibilityMarker(cellIndex);

          this.possibilities.map((dir) => {
            if (dir[1] === cellIndex) {
              dir.map((cell, index) => {
                if (index !== 0) {
                  this.ships.setShipCell(this.shipNumber, this.shipCells, cell.toString());
                  this.placeShipMarker(cell.toString(), this.shipNumber, this.shipCells);

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
              });
            }
          });
        }
      });
      this.#clearPossibilityMarkers();
      this.#clearPossibilities();
    } else {
      // this need to be set so we can find possible placements
      this.ships.setShipCell(this.shipNumber, this.shipCells, cellIndex);

      this.#findAndDrawAllPossiblePlacements(cellIndex, activeShip);
      if (this.possibilities.length === 0) {
        console.log("there are no possibility to place this type of ship here!");
        // we need to remove the click from shipcells
        this.ships.removeShipCell(this.shipNumber, this.shipCells, cellIndex);
        return;
      }
      this.placeShipMarker(cellIndex, this.shipNumber, this.shipCells);
      this.shipCells--;
    }
  }

  #findAndDrawAllPossiblePlacements(cellIndex, activeShip) {
    const upDir = this.#calculatePositions(cellIndex, activeShip, "up");
    const downDir = this.#calculatePositions(cellIndex, activeShip, "down");
    const leftDir = this.#calculatePositions(cellIndex, activeShip, "left");
    const rightDir = this.#calculatePositions(cellIndex, activeShip, "right");
    if (upDir) {
      this.possibilities.push(upDir);
      this.#placePossibilityMarker(upDir[1]);
    }
    if (downDir) {
      this.possibilities.push(downDir);
      this.#placePossibilityMarker(downDir[1]);
    }
    if (leftDir) {
      this.possibilities.push(leftDir);
      this.#placePossibilityMarker(leftDir[1]);
    }
    if (rightDir) {
      this.possibilities.push(rightDir);
      this.#placePossibilityMarker(rightDir[1]);
    }
  }
  #clearPossibilities() {
    this.possibilities = [];
  }

  #placePossibilityMarker(cellNum) {
    this.possibilityMarkings.push(cellNum);
    this.getGameGridCells()[cellNum].setAttribute("class", `possibilites`);
  }
  #removePossibilityMarker(cellIndex) {
    this.possibilityMarkings = this.possibilityMarkings.filter((index) => index !== cellIndex);
  }
  #clearPossibilityMarkers() {
    const gameGridCells = this.getGameGridCells();
    this.possibilityMarkings.forEach((cellIndex) => {
      gameGridCells[cellIndex.toString()].setAttribute("class", "empty");
    });
    this.possibilityMarkings = [];
  }

  #setDirection(activeShip, cellIndex, cells) {
    const adjacentUpCell = parseInt(cells[this.shipCells + 1]) - 10;
    const adjacentDownCell = parseInt(cells[this.shipCells + 1]) + 10;
    const adjacentLeftCell = parseInt(cells[this.shipCells + 1]) - 1;
    const adjacentRightCell = parseInt(cells[this.shipCells + 1]) + 1;
    if (parseInt(cellIndex) === adjacentUpCell) {
      activeShip.direction = "up";
      return;
    }
    if (parseInt(cellIndex) === adjacentDownCell) {
      activeShip.direction = "down";
      return;
    }
    if (parseInt(cellIndex) === adjacentLeftCell) {
      activeShip.direction = "left";
      return;
    }
    if (parseInt(cellIndex) === adjacentRightCell) {
      activeShip.direction = "right";
      return;
    }
  }

  isNotFirstCell() {
    return this.shipCells !== this.ships.getShipCells()[this.shipNumber].length - 1;
  }
}
