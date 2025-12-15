import { Gameboard, Player, Ship } from "./battleship.js";

const container = document.querySelector("#container");
const header = document.createElement("div");
header.classList.add("header");
const footer = document.createElement("div");
footer.classList.add("footer");
const gameboardDiv = document.createElement("div");
gameboardDiv.classList.add("gameboardDiv");
const player1div = document.createElement("div");
player1div.classList.add("board", "player1");
const player2div = document.createElement("div");
player2div.classList.add("board", "player2");

container.append(header, gameboardDiv, footer);
gameboardDiv.append(player1div, player2div);

// GAMEBOARD DISPLAY / SETUP DISPLAY LOGIC
const title = document.createElement("h1");
title.classList.add("title");
title.textContent = "battleShip";
header.append(title);

const playerMessageSpace = document.createElement("div");
playerMessageSpace.classList.add("playerMessageSpace");
const compMessageSpace = document.createElement("div");
compMessageSpace.classList.add("compMessageSpace");

footer.append(playerMessageSpace, compMessageSpace);

function footerShipDisplay() {}
// UI LOGIC BELOW HERE

let player1;
let player2comp;
let attacker;
let defender;
let player1board;
let player2compboard;

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

let gamephase;

function setMessage(div, text) {
  div.textContent = text;
}

function startGame() {
  player1 = new Player("player1");
  player2comp = new Player("player2comp");
  player1board = player1.board;
  player2compboard = player2comp.board;
  attacker = player1;
  defender = player2comp;

  createBoard(attacker, player1div);
  createBoard(defender, player2div);

  enablePlacementPhase(player1);

  placeCPUships();

  updateBoard(player1board, player1div);
  updateBoard(player2compboard, player2div);
}

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
  cell.classList.add("cell");

  parent.append(cell);
}

function enablePlacementPhase() {
  const cells = document.querySelectorAll(".player1 .cell");

  gamephase = "placement";

  setMessage(playerMessageSpace, `Place Your ${shipsToPlace[shipIndex].name}!`);

  cells.forEach((cell) => {
    cell.addEventListener("click", handlePlacementClick);
    cell.addEventListener("mouseover", hoverPreview);
    cell.addEventListener("mouseout", hoverout);
  });

  document.addEventListener("keydown", handleRotateKey);
}

let shipIndex = 0;
const shipsToPlace = [
  p1Destroyer,
  p1Submarine,
  p1Cruiser,
  p1ACarrier,
  p1Battleship,
];

let cpuShipIndex = 0;
const cpuShipsToPlace = [
  p2Destroyer,
  p2Submarine,
  p2Cruiser,
  p2ACarrier,
  p2Battleship,
];
let lastHoveredCell = null;

function handleRotateKey(event) {
  if (event.key !== "r") return;

  const shipIndex = player1.board.ships.length;

  const currentShip = shipsToPlace[shipIndex];
  if (!currentShip) return;

  currentShip.orientation =
    currentShip.orientation === "horizontal" ? "vertical" : "horizontal";

  console.log("Rotated:", currentShip.name, currentShip.orientation);

  if (lastHoveredCell) {
    hoverPreview({ currentTarget: lastHoveredCell });
  }
}

let currentPreviewCoords = [];

function placeCPUships() {
  const currentShip = cpuShipsToPlace[cpuShipIndex];
  if (!currentShip) return;

  const start = findcpuCoord();

  const [x, y] = start.split(",").map(Number);
  let coords = [];
  if (Math.floor(Math.random() * 10) % 2 === 0) {
    currentShip.orientation = "horizontal";
  } else {
    currentShip.orientation = "vertical";
  }
  for (let i = 0; i < currentShip.length; i++) {
    const cx = currentShip.orientation === "horizontal" ? x : x + i;
    const cy = currentShip.orientation === "horizontal" ? y + i : y;
    const key = `${cx},${cy}`;
    coords.push(key);
  }

  // boundary + collision check
  let valid = true;
  for (let key of coords) {
    const [cx, cy] = key.split(",").map(Number);
    if (cx < 0 || cx > 9 || cy < 0 || cy > 9) valid = false;
    if (player2compboard.getCell(key)?.ship) valid = false;
  }

  if (valid) {
    if (player2compboard.placeShip(currentShip, start)) {
      cpuShipIndex++;
      placeCPUships();
    } else {
      placeCPUships();
    }
  } else {
    placeCPUships();
  }
}

function hoverPreview(event) {
  lastHoveredCell = event.currentTarget;

  const shipIndex = player1.board.ships.length;
  const currentShip = shipsToPlace[shipIndex];
  if (!currentShip) return;

  const start = event.currentTarget.dataset.coord;
  const [x, y] = start.split(",").map(Number);

  let coords = [];

  for (let i = 0; i < currentShip.length; i++) {
    const cx = currentShip.orientation === "horizontal" ? x : x + i;
    const cy = currentShip.orientation === "horizontal" ? y + i : y;
    const key = `${cx},${cy}`;
    coords.push(key);
  }

  // boundary + collision check
  let valid = true;
  for (let key of coords) {
    const [cx, cy] = key.split(",").map(Number);
    if (cx < 0 || cx > 9 || cy < 0 || cy > 9) valid = false;
    if (player1board.getCell(key)?.ship) valid = false;
  }

  hoverout();

  //apply preview classes
  coords.forEach((key) => {
    const cell = document.querySelector(`.player1 .cell[data-coord="${key}"]`);
    if (!cell) return;
    cell.classList.add(valid ? "preview-valid" : "preview-invalid");
  });

  //store so hoverout knows what to clear
  currentPreviewCoords = coords;
}

function hoverout() {
  if (!currentPreviewCoords.length) return;

  currentPreviewCoords.forEach((key) => {
    const cell = document.querySelector(`.player1 .cell[data-coord="${key}"]`);
    if (!cell) return;

    cell.classList.remove("preview-valid", "preview-invalid");

    const cellData = player1board.getCell(key);
    cell.classList.toggle("ship", !!cellData.ship);
    cell.classList.toggle("hit", !!cellData.hit);
  });
  currentPreviewCoords = [];
}

function handlePlacementClick(event) {
  const cell = event.target;
  const coord = cell.dataset.coord;

  if (!placeShip(coord)) return;

  updateBoard(player1board, player1div);

  if (shipIndex < shipsToPlace.length) {
    playerMessageSpace.textContent = `Place Your ${shipsToPlace[shipIndex].name}!`;
  } else {
    switchToAttackPhase();
  }
}

function placeShip(coord) {
  let ship = shipsToPlace[shipIndex];

  // increase index if placement successful
  if (player1board.placeShip(ship, coord)) {
    shipIndex++;
    return true;
  } else {
    alert("Try another cell, invalid placement");
    return false;
  }
}

function switchToAttackPhase() {
  gamephase = "battle";
  setMessage(playerMessageSpace, "Let's Battle!");

  //disable placement clicks
  const p1Cells = document.querySelectorAll(".player1 .cell");

  p1Cells.forEach((cell) => {
    cell.removeEventListener("click", handlePlacementClick);
  });

  //enable attack clicks on enemy board
  const p2Cells = document.querySelectorAll(".player2 .cell");

  p2Cells.forEach((cell) => {
    cell.addEventListener("click", handleAttackClick);
  });

  document.removeEventListener("keydown", handleRotateKey);
}

function handleAttackClick(event) {
  const cell = event.target;
  const coord = cell.dataset.coord;

  handlePlayerAttack(cell.dataset.owner, coord);
}

let battleMessageCleared = false;
function handlePlayerAttack(boardOwner, coord) {
  if (gamephase === "battle" && !battleMessageCleared) {
    setMessage(playerMessageSpace, "");
    battleMessageCleared = true;
  }
  // can't hit same spot again
  if (defender.board.getCell(coord).hit === true) return;

  // can't click your own board
  if (boardOwner === attacker.player) {
    return;
  }

  let messageSpace;

  // attack;
  const playOutcome = attacker.attack(defender.board, coord);
  if (attacker.player === "player1") {
    messageSpace = playerMessageSpace;
  } else if (attacker.player === "player2comp") {
    messageSpace = compMessageSpace;
  }
  if (playOutcome === "Game Over!") {
    setMessage(
      messageSpace,
      `You sunk their ${defender.board.getCell(coord).ship.name}!`,
    );
    const defenderDiv = defender.player === "player1" ? player1div : player2div;
    updateBoard(defender.board, defenderDiv);
    setTimeout(() => {
      endGame();
    }, 50);
    return;
  } else if (playOutcome === "Sunk!" && attacker.player === "player1") {
    setMessage(
      messageSpace,
      `You sunk their ${defender.board.getCell(coord).ship.name}!`,
    );
    const defenderDiv = defender.player === "player1" ? player1div : player2div;
    updateBoard(defender.board, defenderDiv);
  } else if (playOutcome === "Sunk!" && attacker.player === "player1") {
    setMessage(
      messageSpace,
      `They sunk your ${defender.board.getCell(coord).ship.name}!`,
    );
    const defenderDiv = defender.player === "player1" ? player1div : player2div;
    updateBoard(defender.board, defenderDiv);
  }

  function endGame() {
    if (confirm("Game Over! Play Again?")) {
      startGame();
    }
  }

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
  const isPlayerBoard = container.classList.contains("player1");
  for (let [key, cellData] of board.cells) {
    const cell = container.querySelector(`[data-coord="${key}"]`);
    if (!cell) continue;

    cell.classList.toggle(
      "ship",
      !!cellData.ship && (isPlayerBoard || cellData.hit),
    );
    cell.classList.toggle("hit", !!cellData.hit);
  }
}

startGame();
