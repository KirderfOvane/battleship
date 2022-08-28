class Grid {
  constructor(gridSize, cellSize, gridElement, name, gridNotation = false) {
    this.name = name;
    this.gridSize = gridSize;
    this.cellSize = cellSize;
    this.gridElement = gridElement;
    this.lastPlayerClicked = undefined;
    this.gridNotation = gridNotation;
  }
  draw(gridElement) {
    let gridParent;

    if (gridElement.children.length < 2) {
      gridParent = document.createElement("div");
      gridParent.setAttribute("id", this.name);
      gridParent.setAttribute("class", "grid");
      if (this.gridNotation) {
        const newGridSize = this.gridSize[0] + this.cellSize;
        gridParent.style.width = newGridSize.toString() + "px";

        gridParent.style.gridTemplateColumns = `repeat(${
          this.gridSize[0] / this.cellSize[0] + 1
        }, ${this.cellSize[0].toString() + "px"})`;
      } else {
        gridParent.style.width = this.gridSize[0].toString() + "px";
        gridParent.style.gridTemplateColumns = `repeat(${this.gridSize[0] / this.cellSize[0]}, ${
          this.cellSize[0].toString() + "px"
        })`;
      }

      gridElement.appendChild(gridParent);
      if (this.name === "player2-grid") {
        gridElement.children[1].style.display = "grid";
        gridElement.children[0].style.display = "none";
      }
    } else {
      // found existing gridParent,setting style to display instead of drawing
      if (gridElement.children[0].id === this.name) {
        gridElement.children[1].style.display = "none";
        gridElement.children[0].style.display = "grid";
      } else {
        gridElement.children[1].style.display = "grid";
        gridElement.children[0].style.display = "none";
      }
      return;
    }
    let node;
    let textnode;
    let gameCellindex = 0;

    let numOfRows = gridSize[0] / cellSize[0];
    let numOfColumns = gridSize[1] / cellSize[1];

    if (this.gridNotation) {
      numOfRows++;
      numOfColumns++;
    }

    for (let y = 0; y < numOfRows; y++) {
      for (let x = 0; x < numOfColumns; x++) {
        node = document.createElement("div");
        if (x === 0 && y === 0) {
          node.setAttribute("class", "empty");
        } else {
          if (this.gridNotation && y === 0 && x !== 0) {
            node.setAttribute("id", "notationx");

            textnode = document.createTextNode(this.gridNotation[0][x - 1]);
            node.appendChild(textnode);
          } else if (this.gridNotation && y !== 0 && x === 0) {
            node.setAttribute("id", "notationy");
            textnode = document.createTextNode(this.gridNotation[1][y - 1]);
            node.appendChild(textnode);
          } else {
            node.setAttribute("id", "cell");
            node.setAttribute("cellIndex", gameCellindex);
            node.addEventListener("click", Grid.cellClicked);

            textnode = document.createTextNode(gameCellindex);
            node.appendChild(textnode);
            gameCellindex++;
          }
        }

        gridParent.appendChild(node);
      }
    }
  }
  getXgridBounds() {
    const gridXbounds = this.gridSize[0] / this.cellSize[0];
    const gridYbounds = this.gridSize[1] / this.cellSize[1];
    const gridCellCount = gridXbounds * gridYbounds;

    const gridXranges = [];
    const step = gridCellCount / gridXbounds;

    for (let i = 0; i <= gridCellCount; i += step) {
      gridXranges.push(i);
    }

    return gridXranges;
  }

  static hideAllGrids() {
    grid.style.display = "none";
  }
  static showAllGrids() {
    grid.style.display = "block";
  }

  static cellClicked = (event) => {
    const cellIndex = event.target.getAttribute("cellIndex");
    console.log(cellIndex);
    //Gaurd: If already marked, do nothing
    const marking = game?.currentPlayer.getMarking(cellIndex);
    if (marking) return;

    if (game?.phase === "shipPlacement") {
      // Gaurd: If possibilityMarkings exists, only accept those possibilities as cellIndex
      const possibilityMarkings = game?.currentPlayer.possibilityMarkings;
      if (possibilityMarkings.length > 0 && !possibilityMarkings.includes(cellIndex)) return;

      game?.currentPlayer.placeShip(cellIndex);
    }
    if (game?.phase === "gameplay") {
      // check that it's not next users turn
      if (!this.lastPlayerClicked || this.lastPlayerClicked !== game?.currentPlayer.name) {
        // no action if cellindex is already marked
        if (game?.currentPlayer.getMarking(cellIndex)) {
          return;
        }
        // set lastplayerclicked-state to be able to keep track of who's turn it is.
        this.lastPlayerClicked = game?.currentPlayer.name;

        // find out who is the opponent of the current active player
        const opponent = game?.currentPlayer.name === "player1" ? "player2" : "player1";

        // check if cell clicked is a hit and act
        // make the shot,which returns {isHit:boolean, sanked:boolean}
        const shot = game[opponent].ships.shot(cellIndex);

        if (shot.isHit) {
          game?.currentPlayer.placeHitMarker(cellIndex);

          if (shot.sanked) {
            statusText.textContent = `${game?.currentPlayer.name} hit and sanked ship!`;
            game?.currentPlayer.displayShipSankedMarker(
              game[opponent].ships.ships[shot.shipNumber].cells,
              shot.shipNumber
            );
            if (game?.checkWinCondition(game[opponent].ships.ships)) {
              statusText.textContent = `${game?.currentPlayer.name} won!`;
              game?.newPhase("end");
              this.hideAllGrids();
              this.lastPlayerClicked = undefined;
              return;
            }
          } else {
            statusText.textContent = `${game?.currentPlayer.name} hit!`;
          }
          game?.displayButtonWithText("Continue");
        } else {
          game?.currentPlayer.placeMissMarker(cellIndex);
          game?.displayButtonWithText("Continue");
          statusText.textContent = `${game?.currentPlayer.name} miss!`;
        }
      } else {
        this.hideAllGrids();
      }
    }
  };
}
