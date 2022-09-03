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
    console.log("draw on gridElement:", gridElement, gridElement.children.length);
    if (gridElement.children.length < 1) {
      gridParent = document.createElement("div");
      gridParent.setAttribute("id", this.name);
      console.log("drawin/creating grid with id:", this.name);
      gridParent.setAttribute("class", "grid");
      if (this.gridNotation) {
        const newGridSize = this.gridSize[0] + this.cellSize;
        gridParent.style.width = newGridSize.toString() + "px";

        gridParent.style.gridTemplateColumns = `repeat(${
          this.gridSize[0] / this.cellSize[0] + 1
        }, ${this.cellSize[0].toString() + "px"})`;
        gridParent.style.justifyContent = "center";
        gridParent.style.alignContent = "center";
      } else {
        gridParent.style.width = this.gridSize[0].toString() + "px";
        gridParent.style.gridTemplateColumns = `repeat(${this.gridSize[0] / this.cellSize[0]}, ${
          this.cellSize[0].toString() + "px"
        })`;
      }

      gridElement.appendChild(gridParent);

      /* if (this.name === "player2-grid") {
        if (gridElement.children[1] === "player2-grid") {
          gridElement.children[1].style.display = "grid";
          gridElement.children[0].style.display = "none";
        }
      } */
    } else {
      console.log("found existing gridParent,showing grid");
      // found existing gridParent,setting style to display instead of drawing
      console.log(gridElement);
      gridElement.style.display = "grid";
      /* if (gridElement.children[0].id === this.name) {
        gridElement.children[1].style.display = "none";
        gridElement.children[0].style.display = "grid";
      } else {
        gridElement.children[1].style.display = "grid";
        gridElement.children[0].style.display = "none";
      } */
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
    let activePlayer;
    if (socket.id === players[0].id) {
      activePlayer = "player1";
    } else {
      activePlayer = "player2";
    }
    console.log("activePlayer:", game[activePlayer].name);
    //Gaurd: If already marked, do nothing
    const marking = game[activePlayer].getMarking(cellIndex);
    if (marking) return;

    if (game?.phase === "shipPlacement") {
      // Gaurd: If possibilityMarkings exists, only accept those possibilities as cellIndex
      const possibilityMarkings = game[activePlayer].possibilityMarkings;
      if (possibilityMarkings.length > 0 && !possibilityMarkings.includes(cellIndex)) return;

      game[activePlayer].placeShip(cellIndex);
    }
    if (game?.phase === "gameplay") {
      // check that it's not next users turn
      if (!this.lastPlayerClicked || this.lastPlayerClicked !== game[activePlayer].name) {
        // no action if cellindex is already marked
        if (game[activePlayer].getMarking(cellIndex)) {
          return;
        }
        // set lastplayerclicked-state to be able to keep track of who's turn it is.
        this.lastPlayerClicked = game[activePlayer].name;

        // find out who is the opponent of the current active player
        const opponent = game[activePlayer].id === 0 ? "player2" : "player1";
        console.log("opponent", opponent);
        // check if cell clicked is a hit and act
        // make the shot,which returns {isHit:boolean, sanked:boolean}
        const shot = game[opponent].ships.shot(cellIndex);

        if (shot.isHit) {
          game[activePlayer].placeHitMarker(cellIndex);

          if (shot.sanked) {
            statusText.textContent = `${game[activePlayer].name} hit and sanked ship!`;
            game[activePlayer].displayShipSankedMarker(
              game[opponent].ships.ships[shot.shipNumber].cells,
              shot.shipNumber
            );
            if (game?.checkWinCondition(game[opponent].ships.ships)) {
              statusText.textContent = `${game[activePlayer].name} won!`;
              game?.newPhase("end");
              this.hideAllGrids();
              this.lastPlayerClicked = undefined;
              return;
            }
          } else {
            statusText.textContent = `${game[activePlayer].name} hit!`;
          }
          game?.displayButtonWithText("Continue");
        } else {
          game[activePlayer].placeMissMarker(cellIndex);
          game?.displayButtonWithText("Continue");
          statusText.textContent = `${game[activePlayer].name} miss!`;
        }
      } else {
        this.hideAllGrids();
      }
    }
  };
}
