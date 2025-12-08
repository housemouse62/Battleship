const { Ship, Fleet, Gameboard } = require("./battleship");

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

describe("Fleet", () => {
  test("Fleet can store ships", () => {
    const fleet = new Fleet();
    fleet.addShip("Destroyer", 3);
    expect(fleet.ships[0].name).toStrictEqual("Destroyer", 3);
  });
  test("Fleet can find a ship by name", () => {
    const fleet = new Fleet();
    fleet.addShip("Destroyer", 3);
    fleet.addShip("Submarine", 3);

    const result = fleet.getShip("Submarine");
    expect(result.name).toBe("Submarine");
    expect(result.length).toBe(3);
  });
  test("Fleet can call hits on a ship and sink it", () => {
    const fleet = new Fleet();
    fleet.addShip("Destroyer", 3);
    fleet.addShip("Submarine", 3);

    fleet.hit("Destroyer");
    fleet.hit("Destroyer");
    fleet.hit("Destroyer");

    expect(fleet.getShip("Destroyer").numHits).toBe(3);
    expect(fleet.getShip("Destroyer").sunk).toBe(true);
  });
  test("Fleet.allSunk returns true when all ships are sunk", () => {
    const fleet = new Fleet();
    fleet.addShip("Destroyer", 3);
    fleet.addShip("Submarine", 3);

    fleet.hit("Destroyer");
    fleet.hit("Destroyer");
    fleet.hit("Destroyer");

    fleet.hit("Submarine");
    fleet.hit("Submarine");
    fleet.hit("Submarine");

    expect(fleet.allSunk()).toBe(true);
  });
});

describe("Gameboard", () => {
  test("get ship: null and hit: false back on any cell at start", () => {
    const board = new Gameboard();
    expect(board.getCell("0,0")).toStrictEqual({ ship: null, hit: false });
  });
  test("place Submarine at anchor '0,0' and return the cell info", () => {
    const board = new Gameboard();
    const fleet = new Fleet();

    const submarine = fleet.addShip("Submarine", 3);

    board.placeShip(submarine, "0,0");

    expect(board.getCell("0,0")).toStrictEqual({
      ship: submarine,
      hit: false,
    });
  });
  test("place Submarine at anchor '0,0' and cover 2 additional cells, '0,1' and '0,2'", () => {
    const board = new Gameboard();
    const fleet = new Fleet();

    const submarine = fleet.addShip("Submarine", 3);

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
    const fleet = new Fleet();

    const submarine = fleet.addShip("Submarine", 3);
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
    const fleet = new Fleet();

    const submarine = fleet.addShip("Submarine", 3);

    board.placeShip(submarine, "0,0");
    board.receiveAttack("1,0");

    expect(board.getCell("1,0")).toStrictEqual({ ship: submarine, hit: true });
  });
  test("you've already hit this square, try again", () => {
    const board = new Gameboard();
    const ship = new Ship("sub", 3);

    board.placeShip(ship, "0,0");

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
    const ship = new Ship("Destroyer", 3);
    const ship2 = new Ship("Submarine", 3);

    console.log = jest.fn();

    board.placeShip(ship, "3,8");
    ship2.orientation = "vertical";
    board.placeShip(ship2, "3,8");

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
  });
});
