class Grid {
  constructor(gridSize, cellSize, gridElement, name) {
    this.name = name;
    this.gridSize = gridSize;
    this.cellSize = cellSize;
    this.gridElement = gridElement;
    this.lastPlayerClicked = undefined;
  }
  draw(gridElement) {
    let gridParent;
    if (gridElement.children.length < 2) {
      gridParent = document.createElement("div");
      gridParent.setAttribute("id", this.name);
      gridParent.setAttribute("class", "grid");
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
    let index = 0;

    const numOfRows = gridSize[0] / cellSize[0];
    const numOfColumns = gridSize[1] / cellSize[1];

    for (let i = 0; i < numOfRows; i++) {
      for (let j = 0; j < numOfColumns; j++) {
        node = document.createElement("div");
        node.setAttribute("id", "cell");
        node.setAttribute("cellIndex", index);
        node.addEventListener("click", Grid.cellClicked);
        textnode = document.createTextNode(index);
        node.appendChild(textnode);
        gridParent.appendChild(node);
        index++;
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

    if (game?.phase === "shipPlacement") {
      //Gaurd: If already marked, do nothing
      const marking = game?.currentPlayer.getMarking(cellIndex);
      if (marking) return;

      game?.currentPlayer.placeShip(cellIndex);
    }
    if (game?.phase === "gameplay") {
      // check that it's not next users turn
      if (!this.lastPlayerClicked || this.lastPlayerClicked !== game?.currentPlayer.name) {
        // no action if cellindex is already marked
        if (game?.currentPlayer.markings[cellIndex]) {
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
