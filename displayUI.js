import { Gameboard, Player, Ship } from "./battleship.js";

const container = document.querySelector("#container");
const player1div = document.createElement("div");
player1div.classList.add("board", "player1");
const player2div = document.createElement("div");
player2div.classList.add("board", "player2");
container.append(player1div, player2div);

const player1 = new Player("player1");
const player2comp = new Player("player2comp");
const player1board = player1.board;
const player2compboard = player2comp.board;
let attacker = player1;
let defender = player2comp;

// build board
function createBoard(player, parent) {
  parent.innerHTML = "";
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      createCells(player, parent, x, y, "50px");
    }
  }
}

// build each cell w/ coordinates and event listener
function createCells(player, parent, x, y, size) {
  const cell = document.createElement("div");
  cell.dataset.coord = `${x},${y}`;
  cell.dataset.owner = player.player;
  cell.style.width = size;
  cell.style.height = size;
  cell.style.backgroundColor = "lightblue";
  cell.classList.add("cell");
  cell.addEventListener("click", (event) =>
    handlePlayerAttack(cell.dataset.owner, cell.dataset.coord),
  );
  parent.append(cell);
}

function handlePlayerAttack(boardOwner, coord) {
  // can't click your own board
  if (boardOwner === attacker.player) {
    return;
  }

  //  attack;
  console.log(attacker.attack(defender.board, coord));

  // Update Defender's board only
  const defenderDiv = defender.player === "player1" ? player1div : player2div;

  updateBoard(defender.board, defenderDiv);

  if (attacker === player1) {
    attacker = player2comp;
    defender = player1;

    // CPU turn
    const cpuCoord = findcpuCoord();
    handlePlayerAttack(defender.player, cpuCoord);
  } else {
    attacker = player1;
    defender = player2comp;
  }
}

function findcpuCoord() {
  const x = Math.floor(Math.random() * 10);
  const y = Math.floor(Math.random() * 10);
  const cpuCoord = `${x},${y}`;
  if (defender.board.getCell(cpuCoord).hit) {
    return findcpuCoord();
  }
  return cpuCoord;
}
function updateBoard(board, container) {
  for (let [key, cellData] of board.cells) {
    const cell = container.querySelector(`[data-coord="${key}"]`);
    if (!cell) continue;

    const containsShip = cellData.ship !== null;
    const isHit = cellData.hit;

    if (containsShip && isHit) cell.style.backgroundColor = "red";
    else if (containsShip && !isHit) cell.style.backgroundColor = "black";
    else if (!containsShip && isHit) cell.style.backgroundColor = "white";
  }
}

createBoard(player1, player1div);
createBoard(player2comp, player2div);

const p1Submarine = new Ship("Submarine", 3);
const p1Cruiser = new Ship("Cruiser", 3);
const p1Battleship = new Ship("Battleship", 4);
const p1ACarrier = new Ship("Aircraft Carrier", 5);
const p1Destroyer = new Ship("Destroyer", 2);

const p2Submarine = new Ship("Submarine", 3);
const p2Cruiser = new Ship("Cruiser", 3);
const p2Battleship = new Ship("Battleship", 4);
const p2ACarrier = new Ship("Aircraft Carrier", 5);
const p2Destroyer = new Ship("Destroyer", 2);

player1board.placeShip(p1Submarine, "0,0");
player1board.placeShip(p1Cruiser, "0,9");
p1Battleship.orientation = "vertical";
player1board.placeShip(p1Battleship, "6,5");
player1board.placeShip(p1ACarrier, "2,3");
p1Destroyer.orientation = "vertical";
player1board.placeShip(p1Destroyer, "4,8");

player2compboard.placeShip(p2Submarine, "0,0");
player2compboard.placeShip(p2Cruiser, "0,9");
p2Battleship.orientation = "vertical";
player2compboard.placeShip(p2Battleship, "6,5");
player2compboard.placeShip(p2ACarrier, "2,3");
p2Destroyer.orientation = "vertical";
player2compboard.placeShip(p2Destroyer, "4,8");

updateBoard(player1board, player1div);
updateBoard(player2compboard, player2div);
