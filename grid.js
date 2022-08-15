class Grid {
  constructor(gridSize, cellSize, gridElement, name) {
    this.name = name;
    this.gridSize = gridSize;
    this.cellSize = cellSize;
    this.gridElement = gridElement;
    this.lastPlayerClicked = undefined;
  }
  draw(gridElement) {
    // console.log("drawing Grid");
    let gridParent;
    if (gridElement.children.length < 2) {
      // console.log("creating gridParent with id: ", this.name);
      gridParent = document.createElement("div");
      gridParent.setAttribute("id", this.name);
      gridParent.setAttribute("class", "grid");
      gridElement.appendChild(gridParent);
      if (this.name === "player2-grid") {
        gridElement.children[1].style.display = "grid";
        gridElement.children[0].style.display = "none";
      }
    } else {
      // console.log("found existing gridParent,setting style to display instead of drawing");
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

  static hideAllGrids() {
    grid.style.display = "none";
  }
  static showAllGrids() {
    grid.style.display = "block";
  }

  static cellClicked = (event) => {
    const cellIndex = event.target.getAttribute("cellIndex");
    if (game?.phase === "shipPlacement") {
      game?.currentPlayer.placeShip(cellIndex);
    }
    if (game?.phase === "gameplay") {
      if (!this.lastPlayerClicked || this.lastPlayerClicked !== game?.currentPlayer.name) {
        this.lastPlayerClicked = game?.currentPlayer.name;
        const opponent = game?.currentPlayer.name === "player1" ? "player2" : "player1";
        console.log(game[opponent].ships);
        console.log(game[opponent].ships.isShipHit(cellIndex));
        if (game[opponent].ships.isShipHit(cellIndex)) {
          game?.currentPlayer.placeMarker(cellIndex, "hit");
          game?.displayButtonWithText("Continue");
          statusText.textContent = `${game?.currentPlayer.name} hit!`;
        } else {
          console.log("miss", cellIndex);
          game?.currentPlayer.placeMarker(cellIndex, "miss");
          game?.displayButtonWithText("Continue");
          statusText.textContent = `${game?.currentPlayer.name} miss!`;
        }
      } else {
        this.hideAllGrids();
      }
    }
  };
}
