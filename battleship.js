class Ship {
  constructor(name, length) {
    this.name = name;
    this.length = length;
    this.numHits = 0;
    this.sunk = false;
    this.orientation = "horizontal";
  }

  hit() {
    if (this.sunk) return;
    this.numHits++;
    this.isSunk();
    return this.numHits;
  }

  isSunk() {
    if (this.numHits === this.length) this.sunk = true;
    return this.sunk;
  }
}

class Gameboard {
  constructor() {
    this.cells = new Map();
    this.ships = [];

    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        const key = `${x},${y}`;
        this.cells.set(key, { ship: null, hit: false });
      }
    }
  }

  //after testing change this to. ---  return { ...this.cells.get(string) };

  getCell(string) {
    return this.cells.get(string);
  }

  placeShip(ship, coord) {
    let shipAnchor = coord.split(",");
    let x = parseInt(shipAnchor[0]);
    let y = parseInt(shipAnchor[1]);
    let spot = [];

    if (ship.orientation !== "horizontal" && ship.orientation !== "vertical") {
      console.log("Invalid orientation! Must be horizontal or vertical");
      return;
    }
    // build array of potential ship placement
    for (let i = 0; i < ship.length; i++) {
      //decide on the coordinate for this run
      const shipAnchorX = ship.orientation === "horizontal" ? x + i : x;
      const shipAnchorY = ship.orientation === "vertical" ? y + i : y;
      const key = `${shipAnchorX},${shipAnchorY}`;
      //check board boundry
      if (
        shipAnchorX < 0 ||
        shipAnchorX >= 10 ||
        shipAnchorY < 0 ||
        shipAnchorY >= 10
      ) {
        console.log("Ships cannot be placed off the board, try again!");
        return;
      }

      // coordinate for ship
      const cell = this.getCell(key);
      if (cell.ship) {
        console.log("You've got a ship there already, try a new spot");
        return;
      }
      spot.push(key);
    }
    //place ship
    for (const key of spot) {
      this.cells.set(key, { ship, hit: false });
    }
    this.ships.push(ship);
    //return cells for testing
    return spot.map((c) => this.getCell(c));
  }

  receiveAttack(coord) {
    let cell = this.getCell(coord);

    if (cell === undefined) return;
    // hit cell that was already hit
    if (cell.hit === true) {
      console.log("you've already hit this square, try again");
      return;
    }
    // hit cell
    cell.hit = true;

    //hit empty cell
    if (cell.ship === null) {
      console.log("you missed");
      return;
    }

    //successful hit
    cell.ship.hit();
    this.allSunk();
  }

  allSunk() {
    if (this.ships.every((ship) => ship.sunk === true)) {
      return true;
    } else return false;
  }
}

class Player {
  constructor(player) {
    this.player = player;
    this.board = new Gameboard();
  }

  attack(opponentBoard, coord) {
    return opponentBoard.receiveAttack(coord);
  }
}
module.exports = { Ship, Gameboard, Player };
