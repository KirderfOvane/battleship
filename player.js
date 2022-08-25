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
      imageRotation = this.ships.ships[type].direction;
      console.log("imagerotation:", imageRotation);

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

  #extrapolate(gridValue, direction) {
    //  console.log(gridValue, direction);

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
        console.log("ERROR");
        break;
    }
    console.log(extrapolatedNumber, direction);

    if (extrapolatedNumber > 99) return false;
    if (extrapolatedNumber < 0) return false;
    return extrapolatedNumber;
  }

  #isColliding(gridPoint) {
    this.ships.getShipCells().map((shipCells) => {
      if (shipCells.includes(gridPoint)) {
        console.log("FOUND COLLISION");

        return true;
      }
    });
    console.log("found no collision");
    return false;
  }

  #calculatePositions(cellIndex, activeShip) {
    // check cellindex collisions before looping
    if (this.#isColliding(cellIndex)) return false;

    let extrapolatedGridPoint = null;
    let collision = false;
    let positions = [];

    // add cellIndex(click 2) cell to positions
    positions.push(cellIndex);

    for (let i = activeShip.cells.length - 3; i >= 0; i--) {
      if (!extrapolatedGridPoint) {
        extrapolatedGridPoint = this.#extrapolate(parseInt(cellIndex), activeShip.direction);
      } else {
        extrapolatedGridPoint = this.#extrapolate(
          parseInt(extrapolatedGridPoint),
          activeShip.direction
        );
      }
      if (extrapolatedGridPoint === false) {
        console.log("FOUND OUT OF GRID-BOUNDS");
        collision = true;
        return;
      }
      // Gaurd collision-check
      if (this.#isColliding(extrapolatedGridPoint)) {
        collision = true;
        return;
      }
      positions.push(extrapolatedGridPoint);
    }
    // Gaurd: If collision is detected inside the loop, don't do bound-check, just abort.
    if (collision) return false;

    // Gaurd out of x bounds check
    if (activeShip.direction === "left" || activeShip.direction === "right") {
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
      // console.log(xRanges[i], shipCellOne, xRanges[i] > shipCellOne);
      if (xRanges[i] > parseInt(shipCellOne)) {
        // console.log("FOUND range", xRanges[i - 1] + "-", xRanges[i]);
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

      // Now when we know direction we can calculate positions of the ship based on it's cell-length
      const calculation = this.#calculatePositions(cellIndex, activeShip);
      console.log(calculation);
      if (calculation) {
        // console.log(calculation, this.shipCells, this.shipNumber);
        calculation.map((pos) => {
          this.ships.setShipCell(this.shipNumber, this.shipCells, pos.toString());
          this.placeShipMarker(pos.toString(), this.shipNumber, this.shipCells);
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
        });
      }
    } else {
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
