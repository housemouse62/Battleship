const { Ship, Gameboard, Player } = require("./battleship");

describe("Ship", () => {
  test("defines hit()", () => {
    const ship = new Ship("Destroyer", 3);
    expect(typeof ship.hit).toBe("function");
  });
  test("hit() increments number of hits when called", () => {
    const ship = new Ship("Destroyer", 3);
    expect(ship.hit()).toBe(1);
  });
  test("new ship created and returns correct values", () => {
    const ship = new Ship("Destroyer", 3);
    expect(ship.name).toBe("Destroyer");
    expect(ship.length).toBe(3);
    expect(ship.numHits).toBe(0);
    expect(ship.sunk).toBe(false);
    expect(ship.orientation).toBe("horizontal");
  });
  test("check if sunk", () => {
    const ship = new Ship("Destroyer", 3);
    expect(ship.sunk).toBe(false);
  });
  test("hit() increments number of hits when called", () => {
    const ship = new Ship("Destroyer", 3);
    expect(ship.hit()).toBe(1);
    expect(ship.hit()).toBe(2);
    expect(ship.isSunk()).toBe(false);
    expect(ship.hit()).toBe(3);
    expect(ship.isSunk()).toBe(true);
  });
});

describe("Gameboard", () => {
  test("Gameboard class can store ships", () => {
    const board = new Gameboard();
    const destroyer = new Ship("Destroyer", 3);
    board.placeShip(destroyer, "3,5");
    expect(board.ships[0].name).toStrictEqual("Destroyer", 3);
  });
  test("get ship: null and hit: false back on any cell at start", () => {
    const board = new Gameboard();
    expect(board.getCell("0,0")).toStrictEqual({ ship: null, hit: false });
  });
  test("place Submarine at anchor '0,0' and return the cell info", () => {
    const board = new Gameboard();
    const submarine = new Ship("Submarine", 3);

    board.placeShip(submarine, "0,0");

    expect(board.getCell("0,0")).toStrictEqual({
      ship: submarine,
      hit: false,
    });
  });
  test("place Submarine at anchor '0,0' and cover 2 additional cells, '0,1' and '0,2'", () => {
    const board = new Gameboard();

    const submarine = new Ship("Submarine", 3);

    board.placeShip(submarine, "0,0");
    expect(board.getCell("0,0")).toStrictEqual({
      ship: submarine,
      hit: false,
    });
    expect(board.getCell("1,0")).toStrictEqual({
      ship: submarine,
      hit: false,
    });
    expect(board.getCell("2,0")).toStrictEqual({
      ship: submarine,
      hit: false,
    });
  });
  test("rotate to vertical, place Submarine at anchor '0,0' and cover 2 additional cells, '1,0' and '2,0'", () => {
    const board = new Gameboard();
    const submarine = new Ship("Submarine", 3);

    submarine.orientation = "vertical";

    board.placeShip(submarine, "0,0");
    expect(board.getCell("0,0")).toStrictEqual({
      ship: submarine,
      hit: false,
    });
    expect(board.getCell("0,1")).toStrictEqual({
      ship: submarine,
      hit: false,
    });
    expect(board.getCell("0,2")).toStrictEqual({
      ship: submarine,
      hit: false,
    });
  });
  test("receive attack on Submarine at cell '1,0' and change state", () => {
    const board = new Gameboard();

    const submarine = new Ship("Submarine", 3);

    board.placeShip(submarine, "0,0");
    board.receiveAttack("1,0");

    expect(board.getCell("1,0")).toStrictEqual({ ship: submarine, hit: true });
  });
  test("you've already hit this square, try again", () => {
    const board = new Gameboard();
    const submarine = new Ship("Submarine", 3);

    board.placeShip(submarine, "0,0");

    board.receiveAttack("0,0");

    console.log = jest.fn();

    board.receiveAttack("0,0");
    expect(console.log).toHaveBeenCalledWith(
      "you've already hit this square, try again",
    );
  });
  test("make sure square only is hit once", () => {
    const board = new Gameboard();
    const ship = new Ship("Destroyer", 3);

    jest.spyOn(ship, "hit");

    board.placeShip(ship, "0,0");

    board.receiveAttack("0,0");
    //should not call ship.hit()
    board.receiveAttack("0,0");

    expect(ship.hit).toHaveBeenCalledTimes(1);
  });
  test("ships cannot be placed on top of each other, placing at origin", () => {
    const board = new Gameboard();
    const destroyer = new Ship("Destroyer", 3);
    const submarine = new Ship("Submarine", 3);

    console.log = jest.fn();

    board.placeShip(destroyer, "3,8");
    submarine.orientation = "vertical";
    board.placeShip(submarine, "3,8");

    expect(console.log).toHaveBeenCalledWith(
      "You've got a ship there already, try a new spot",
    );
  });
  test("ships cannot be placed on top of each other, not placing at origin", () => {
    const board = new Gameboard();
    const ship = new Ship("bottomship", 3);
    const ship2 = new Ship("topship", 3);

    console.log(board.getCell("3,6"));

    console.log = jest.fn();

    board.placeShip(ship, "3,6");
    ship2.orientation = "vertical";
    board.placeShip(ship2, "4,5");

    expect(console.log).toHaveBeenCalledWith(
      "You've got a ship there already, try a new spot",
    );
  });
  test("check to see if some of the squares do register a second ship", () => {
    const board = new Gameboard();
    const ship = new Ship("bottomship", 3);
    const ship2 = new Ship("topship", 3);

    board.placeShip(ship, "3,6");
    ship2.orientation = "vertical";
    board.placeShip(ship2, "4,5");

    expect(board.getCell("4,6")).toStrictEqual({
      ship: ship,
      hit: false,
    });
    expect(board.getCell("4,5")).toStrictEqual({ ship: null, hit: false });
    expect(board.getCell("4,7")).toStrictEqual({ ship: null, hit: false });
  });
  test("cannot place ship outside of board", () => {
    const board = new Gameboard();
    const ship = new Ship("bottomship", 3);
    const ship2 = new Ship("topship", 3);

    console.log = jest.fn();

    board.placeShip(ship, "8,6");
    ship2.orientation = "vertical";
    board.placeShip(ship2, "0,9");

    expect(console.log).toHaveBeenCalledWith(
      "Ships cannot be placed off the board, try again!",
    );
  });
  test("ship does not partially place when invalid placement is attempted", () => {
    const board = new Gameboard();
    const ship = new Ship("Sub", 3);

    board.placeShip(ship, "8,5"); // horizontal by default

    expect(board.getCell("8,5").ship).toBe(null);
    expect(board.getCell("9,5").ship).toBe(null);
  });
  test("correct number of cells filled by multiple boats", () => {
    const board = new Gameboard();
    const ship = new Ship("Submarine", 3);
    const ship2 = new Ship("Cruiser", 3);
    const ship3 = new Ship("Battleship", 4);
    const ship4 = new Ship("Aircraft Carrier", 5);
    const ship5 = new Ship("Destroyer", 2);

    board.placeShip(ship, "0,9");
    board.placeShip(ship2, "7,5");
    ship3.orientation = "vertical";
    board.placeShip(ship3, "1,4");
    board.placeShip(ship4, "2,3");
    ship5.orientation = "vertical";
    board.placeShip(ship5, "4,4");

    expect(board.getCell("0,9")).toStrictEqual({ ship: ship, hit: false });
    expect(board.getCell("1,9")).toStrictEqual({ ship: ship, hit: false });
    expect(board.getCell("2,9")).toStrictEqual({ ship: ship, hit: false });
    expect(board.getCell("8,5")).toStrictEqual({ ship: ship2, hit: false });
    expect(board.getCell("9,5")).toStrictEqual({ ship: ship2, hit: false });
    expect(board.getCell("7,5")).toStrictEqual({ ship: ship2, hit: false });
    expect(board.getCell("1,4")).toStrictEqual({ ship: ship3, hit: false });
    expect(board.getCell("1,5")).toStrictEqual({ ship: ship3, hit: false });
    expect(board.getCell("1,6")).toStrictEqual({ ship: ship3, hit: false });
    expect(board.getCell("1,7")).toStrictEqual({ ship: ship3, hit: false });
    expect(board.getCell("2,3")).toStrictEqual({ ship: ship4, hit: false });
    expect(board.getCell("3,3")).toStrictEqual({ ship: ship4, hit: false });
    expect(board.getCell("4,3")).toStrictEqual({ ship: ship4, hit: false });
    expect(board.getCell("5,3")).toStrictEqual({ ship: ship4, hit: false });
    expect(board.getCell("6,3")).toStrictEqual({ ship: ship4, hit: false });
    expect(board.getCell("4,4")).toStrictEqual({ ship: ship5, hit: false });
    expect(board.getCell("4,5")).toStrictEqual({ ship: ship5, hit: false });
  });
  test("report true when all ships sunk", () => {
    const board = new Gameboard();
    const ship = new Ship("Submarine", 3);

    board.placeShip(ship, "0,9");
    board.receiveAttack("0,9");
    board.receiveAttack("1,9");
    board.receiveAttack("2,9");

    expect(board.allSunk()).toBe(true);
  });
  test("allSunk is triggered after the final hit", () => {
    const board = new Gameboard();
    const ship = new Ship("Destroyer", 3);

    jest.spyOn(board, "allSunk");

    board.placeShip(ship, "0,9");
    board.receiveAttack("0,9");
    board.receiveAttack("1,9");
    board.receiveAttack("2,9");

    expect(board.allSunk).toHaveBeenCalledTimes(3);
    expect(board.allSunk()).toBe(true);
  });
  test("placeShip returns an array of placed cells", () => {
    const board = new Gameboard();
    const ship = new Ship("Destroyer", 3);

    const result = board.placeShip(ship, "0,0");

    expect(result).toHaveLength(3);
    expect(result[0]).toStrictEqual({ ship, hit: false });
  });
  test("hitting empty cell does not call ship.hit()", () => {
    const board = new Gameboard();
    const ship = new Ship("Destroyer", 3);

    board.placeShip(ship, "0,0");
    jest.spyOn(ship, "hit");

    board.receiveAttack("4,5");

    expect(ship.hit).toHaveBeenCalledTimes(0);
  });
  test("hitting empty cell changes hit to true", () => {
    const board = new Gameboard();
    const ship = new Ship("Destroyer", 3);

    board.placeShip(ship, "0,0");

    board.receiveAttack("4,5");

    expect(board.getCell("4,5")).toStrictEqual({ ship: null, hit: true });
  });
  test("allSunk returns false if at least one ship is floating", () => {
    const board = new Gameboard();
    const ship = new Ship("Submarine", 3);
    const ship2 = new Ship("Destroyer", 2);

    board.placeShip(ship, "0,9");
    board.placeShip(ship2, "5,5");

    board.receiveAttack("0,9");
    board.receiveAttack("1,9");
    // not enough to sink Submarine fully

    expect(board.allSunk()).toBe(false);
  });
  test("ships array stores all placed ships", () => {
    const board = new Gameboard();

    const ship1 = new Ship("A", 2);
    const ship2 = new Ship("B", 3);

    board.placeShip(ship1, "0,0");
    board.placeShip(ship2, "5,5");

    expect(board.ships.length).toBe(2);
  });
  test("cannot add extra hits to a sunk ship", () => {
    const ship = new Ship("Test", 1);
    ship.hit(); // sinks

    ship.hit(); // unnecessary 2nd hit

    expect(ship.numHits).toBe(1);
    expect(ship.isSunk()).toBe(true);
  });
  test("placeShip rejects non-ship objects", () => {
    const board = new Gameboard();
    console.log = jest.fn();

    board.placeShip({ length: 3 }, "0,0");

    expect(console.log).toHaveBeenCalled();
  });
  test("attacking off-board coordinates does nothing", () => {
    const board = new Gameboard();
    expect(() => board.receiveAttack("20,20")).not.toThrow();
  });
  test("invalid orientation should prevent ship placement", () => {
    const board = new Gameboard();
    const ship = new Ship("Test", 2);

    ship.orientation = "diagonal";
    console.log = jest.fn();

    board.placeShip(ship, "0,0");

    expect(console.log).toHaveBeenCalled();
  });
  test("getCell returns undefined for invalid key", () => {
    const board = new Gameboard();
    expect(board.getCell("100,100")).toBeUndefined();
  });
  test("cannot place ship with negative start coordinates", () => {
    const board = new Gameboard();
    const ship = new Ship("Test", 2);

    console.log = jest.fn();
    board.placeShip(ship, "-1,0");

    expect(console.log).toHaveBeenCalled();
  });
  test("isSunk always returns a boolean", () => {
    const ship = new Ship("Test", 2);
    expect(typeof ship.isSunk()).toBe("boolean");
  });
  test("multiple ships do not share state", () => {
    const ship1 = new Ship("A", 2);
    const ship2 = new Ship("B", 3);

    ship1.hit();
    expect(ship2.numHits).toBe(0);
  });
});

describe("Player", () => {
  test("create a gameboard for both a real player and a computer player and returns correct values", () => {
    const realPlayer = new Player("Player One");
    const computer = new Player("Player Two");

    expect(realPlayer.player).toBe("Player One");
    expect(realPlayer.board).toBe(realPlayer.board);
    expect(computer.player).toBe("Player Two");
    expect(computer.board).toBe(computer.board);
  });
  test("place ship for player one and two", () => {
    const realPlayer = new Player("Player One");
    const computer = new Player("Player Two");

    const realBoard = realPlayer.board;
    const compBoard = computer.board;

    const realDestroyer = new Ship("Destroyer", 3);
    const compDestroyer = new Ship("Destroyer", 3);

    realBoard.placeShip(realDestroyer, "0,0");
    compBoard.placeShip(compDestroyer, "5,5");

    expect(realBoard.getCell("0,0")).toStrictEqual({
      ship: realDestroyer,
      hit: false,
    });
    expect(compBoard.getCell("5,5")).toStrictEqual({
      ship: compDestroyer,
      hit: false,
    });
    expect(compBoard.getCell("6,5")).toStrictEqual({
      ship: compDestroyer,
      hit: false,
    });
  });
  test("place ship for player one doesn't show on player two board and vice versa", () => {
    const realPlayer = new Player("Player One");
    const computer = new Player("Player Two");

    const realBoard = realPlayer.board;
    const compBoard = computer.board;

    const realDestroyer = new Ship("Destroyer", 3);
    const compDestroyer = new Ship("Destroyer", 3);

    realBoard.placeShip(realDestroyer, "0,0");
    compBoard.placeShip(compDestroyer, "5,5");

    expect(realBoard.getCell("0,0")).toStrictEqual({
      ship: realDestroyer,
      hit: false,
    });
    expect(compBoard.getCell("5,5")).toStrictEqual({
      ship: compDestroyer,
      hit: false,
    });
    expect(realBoard.getCell("5,5")).toStrictEqual({
      ship: null,
      hit: false,
    });
    expect(compBoard.getCell("0,0")).toStrictEqual({
      ship: null,
      hit: false,
    });
  });
  test("player one can attack player two and it updates the board correctly", () => {
    const realPlayer = new Player("Player One");
    const computer = new Player("Player Two");

    const realBoard = realPlayer.board;
    const compBoard = computer.board;

    const realDestroyer = new Ship("Destroyer", 3);
    const compDestroyer = new Ship("Destroyer", 3);

    realBoard.placeShip(realDestroyer, "0,0");
    compBoard.placeShip(compDestroyer, "5,5");

    realPlayer.attack(compBoard, "6,5");
    computer.attack(realBoard, "0,0");

    expect(realBoard.getCell("0,0")).toStrictEqual({
      ship: realDestroyer,
      hit: true,
    });
    expect(realDestroyer.numHits).toBe(1);
    expect(compBoard.getCell("6,5")).toStrictEqual({
      ship: compDestroyer,
      hit: true,
    });
    expect(compDestroyer.numHits).toBe(1);
  });
  test("player one and two can miss it updates the board correctly", () => {
    const realPlayer = new Player("Player One");
    const computer = new Player("Player Two");

    const realBoard = realPlayer.board;
    const compBoard = computer.board;

    const realDestroyer = new Ship("Destroyer", 3);
    const compDestroyer = new Ship("Destroyer", 3);

    realBoard.placeShip(realDestroyer, "0,0");
    compBoard.placeShip(compDestroyer, "5,5");

    realPlayer.attack(compBoard, "5,9");
    computer.attack(realBoard, "6,0");

    expect(realBoard.getCell("6,0")).toStrictEqual({
      ship: null,
      hit: true,
    });
    expect(realDestroyer.numHits).toBe(0);
    expect(compBoard.getCell("5,9")).toStrictEqual({
      ship: null,
      hit: true,
    });
    expect(compDestroyer.numHits).toBe(0);
  });
  test("double hit should not increment hits or break the game", () => {
    const realPlayer = new Player("Player One");
    const computer = new Player("Player Two");

    const realBoard = realPlayer.board;
    const compBoard = computer.board;

    const compDestroyer = new Ship("Destroyer", 3);

    compBoard.placeShip(compDestroyer, "5,5");

    realPlayer.attack(compBoard, "5,5");
    realPlayer.attack(compBoard, "5,5");

    expect(compDestroyer.numHits).toBe(1);
    expect(compBoard.getCell("5,5")).toStrictEqual({
      ship: compDestroyer,
      hit: true,
    });
  });
});
