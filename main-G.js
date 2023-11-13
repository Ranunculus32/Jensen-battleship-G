/*
Det här dokumentet tjänar som en guide för att implementera spelet 
battleship i inlämningsuppgiften för "Grundläggande JS" på G nivå. Några 
funktioner är redan implementerade åt er, andra är delvis implementerade 
och resterande saknar implementation helt. Er uppgift är att fylla i det 
som saknas i detta dokument.

Om ni kikar i index.html kan ni se att ett skrip test.js laddas in i 
dokumentet. Detta skript kör bl.a tester för några av funktioner som ni
ska implementera i denna uppgift. Ni kan se resultatet av testerna om ni 
öppnar index.html i webbläsaren och tittar i konsollen. Ni kan se att 
många tester just nu är röda (passerar inte). Jag rekommenderar att ni 
inte kommenterar bort test.js från index.html förrän alla tester är 
gröna (passerar). Börja med att implementera de nödvändiga funktionerna 
för att få testerna att passera:

* isValidCoord
* isValidShip
* markCoord
* hasLost
* registerHitOrBom
* switchPlayer

Ni behöver också implementera 

* drawEmptyBoard (bör inte vara så svår om man förstår displayMarkersOnGrid)

Ni skall alltså inte modifiera test.js filen utan modifiera bara i
main-G.js (detta dokument). Ni får naturligtvis skapa hjälp funktioner och 
annat som ni kan tänkas behöva, men ändra helst inte för mycket i de redan 
färdigimplementerade funktionerna, annars kan det bli ganska stökigt för 
er, såvida ni inte vill ha en utmaning :-D. 

När testerna passerar så kan ni kommentera bort test.js i index.html, 
gå längst ned i main-G.js (detta dokument) och ta bort kommentaren 
framför "runGame()" så att huvudfunktionen kör. 

*/

///////////////////// Globala variabler //////////////////////////

const rows = 10;
const cols = 10;
const nrOfShips = 1;

const player1 = {
  mark: 1,
  boms: [],
  hits: [],
  ships: [],
};

const player2 = {
  mark: 2,
  boms: [],
  hits: [],
  ships: [],
};

let players = { current: player1, enemy: player2 };

///////////////////// Helper functions //////////////////////////

// determine if val is primitive value (true/false)
function isPrimitive(val) {
  return ["number", "boolean", "string", "undefined"].includes(typeof val);
}

// determine if val is object value (true/false)
function isObject(val) {
  return typeof val === "object";
}

// Helper method added to Object prototype to determine equality
// Example usage:
//
// const obj = { name: "Pelle" age: 17 }
// obj.equals({ name: "Pelle", age: 17 }) => true
// obj.equals({ name: "Patrik", age: 18 }) => false
Object.prototype.equals = function (otherObj) {
  const thisKeys = Object.keys(this);
  const otherKeys = Object.keys(otherObj);
  if (thisKeys.length !== otherKeys.length) {
    return false;
  }
  for (let key of thisKeys) {
    const thisVal = this[key];
    const otherVal = otherObj[key];
    if (typeof thisVal !== "object") {
      if (thisVal !== otherVal) {
        return false;
      }
    } else {
      if (!thisVal.equals(otherVal)) {
        return false;
      }
    }
  }
  return true;
};

// Helper method added to Array prototype to determine if value exist in array
// Example usage:
//
// const arr = [{ age: 1 }, { age: 2 }]
// arr.contains({ age: 2 }) => true
// arr.contains({ age: 3 }) => false
Array.prototype.contains = function (value) {
  if (isObject(value) && value.length === undefined) {
    for (let i = 0; i < this.length; i++) {
      if (value.equals(this[i])) {
        // we found an equal element
        return true;
      }
    }
  }
  if (isPrimitive(value)) {
    return this.includes(value); // see if array has primitive value inside
  }
  return false;
};

///////////////////// Initialize ships //////////////////////////

// determines if a coordinate is valid or not. It should not get out of boundary
// Check test.js for specification of how it should work

function isValidCoord(coord) {
  if (typeof coord === "object" && coord !== null) {
    if ("row" in coord && "col" in coord) {
      if (typeof coord.row === "number" && typeof coord.col === "number") {
        if (
          coord.row >= 0 &&
          coord.row <= 9 &&
          coord.col >= 0 &&
          coord.col <= 9
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

// determines if a ship is a valid or not considering length and coordinates
// tip: use isValidCoord
// Check test.js for specification of how it should work
function isValidShip(ship) {
  if (!Array.isArray(ship) || ship.length < 2 || ship.length > 5) {
    return false;
  }

  for (let i = 0; i < ship.length; i++) {
    const { row, col } = ship[i];

    if (
      typeof row !== "number" ||
      typeof col !== "number" ||
      row < 0 ||
      row > 9 ||
      col < 0 ||
      col > 9
    ) {
      return false;
    }

    if (i > 0) {
      const prevCoord = ship[i - 1];
      if (row !== prevCoord.row && col !== prevCoord.col) {
        return false;
      }
    }
  }

  return true;
}

// prompt user for a ships all coordinates
// given input of following format:
//    "1,1 1,2 1,3"
// return ship of following format:
//    [{ row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }]
function promtUserForShipCoords(mark, nr) {
  const input = prompt(`Player ${mark}, Ship ${nr}:`);
  const array = input.split(" "); // splits "1,1 1,2 1,3" => ["1,1", "1,2", "1,3"]
  const ship = [];
  // text = "1,1", "1,2", "1,3"
  for (let text of array) {
    const [y, x] = text.split(","); // "1,2" => ["1", "2"]
    ship.push({ row: parseInt(y), col: parseInt(x) }); // push { row: 1, col: 2 }
  }
  // control whole ship is valid before outputting
  if (isValidShip(ship)) {
    return ship;
  } else {
    console.error(`  * Ships must be straigh lines
    * Each coordinate of ship must be inside board
    * Each ship must be larger than 2 coordinates
    * Each ship must not be longer than 5 coordinates`);
    return promtUserForShipCoords(mark, nr); // try again
  }
}

// displays an array of markers on the grid. The markers coorinates
// tells where to mark and the marker what to display on the grid
//
// Example
// [{ row: 1, col: 2, marker: 1 }, { row: 1, col: 3, marker: "X" }]
function displayMarkersOnGrid(markers) {
  let textBoard = "_____________________\n"; // roof
  for (let row = 0; row < rows; row++) {
    textBoard += "|";
    for (let col = 0; col < cols; col++) {
      let cell = null;
      // check if row and col exists in marker, if so save marker.mark in cell
      markers.forEach(function (marker) {
        if (marker.row === row && marker.col === col) {
          cell = marker.mark;
        }
      });
      // if cell has been found for row and col
      if (cell !== null) {
        textBoard += `${cell}|`; // add content in cell
      } else {
        textBoard += `_|`; // add empty cell
      }
    }
    textBoard += "\n"; // and new line break after each row
  }
  console.log(textBoard); // print the whole board
}

// displays an empty board
// tip: use displayMarkersOnGrid
function drawEmptyBoard() {
  /* TODO */
}

// Ask user for all his/her ships positions
// Ask for 1 ship at a time.
function initializeShips(player) {
  console.log(`Choose your ${nrOfShips} ships!`);
  drawEmptyBoard();
  player.ships = []; // reset ships
  // for all nrOfShips (5) ask user for each ships coord
  for (let i = 0; i < nrOfShips; i++) {
    // ask user for a single ships coords
    const newShip = promtUserForShipCoords(player.mark, i + 1);
    console.clear();
    player.ships = [...newShip, ...player.ships]; // add ship to previous ship coords
    // prepare ships with marks (1 or 2) to display on grid
    const markedShips = player.ships.map((coord) => ({
      ...coord,
      mark: player.mark,
    }));
    displayMarkersOnGrid(markedShips); // display all ships
  }
  const ok = confirm("Press Ok if you are happy with your ships.");
  if (ok) {
    console.clear();
  } else {
    initializeShips(player); // redo
  }
}

///////////////////// Game loop //////////////////////////

// adds mark (1, 2 or X) to coordinate object { row, col } => { row, col, mark }
// Check test.js for specification of how it should work

function markCoord(coord, symbol) {
  return { ...coord, mark: symbol };
}

// determines if player has lost (true/false)
// tip: check out player.ships and player.hits ;-)
// Check test.js for specification of how it should work
function hasLost(player) {
  for (const ship of player.ships) {
    if (!player.hits.some((hit) => hit.equals(ship))) {
      return false;
    }
  }
  return true;
}

// adds guess coordinates { row, col } to either players hits or boms array
// depending on whether it hit or missed any of the players ships coordinates
// Check test.js for specification of how it should work

function registerHitOrBom(guess, player) {
  if (player.ships.some((ship) => ship.equals(guess))) {
    player.hits.push(guess);
  } else {
    player.boms.push(guess);
  }
}

// switch players object around so that
// { current: p1, enemy: p2 } => { current: p2, enemy: p1 }
// Check test.js for specification of how it should work

function switchPlayers(players) {
  const { current, enemy } = players;
  players.current = enemy;
  players.enemy = current;
  return players;
}

// displays the winner and loser of the game in console
function displayGameOver(winner, loser) {
  console.log(`Player ${winner.mark} won over player ${loser.mark}!`);
}

// ask user for guess where player has hidden ship
function promptPlayerForGuess(player) {
  const input = prompt(`Player ${player.mark}, Choose your target:`);
  const [y, x] = input.split(","); // given coords "1,3" => ["1", "3"]
  const guess = { row: parseInt(y), col: parseInt(x) }; // guess = { row: 1, col: 3}
  // guess coords are not ok
  if (!isValidCoord(guess)) {
    console.error(
      `You must provide coordinates (0-${rows},0-${cols}) for a strike between at (row, col)`
    );
    guess = promptPlayerForGuess(player); // try again
  }
  return guess;
}

// given a player, display that players hits and boms array with help of
// displayMarkersOnGrid
function displayHitsAndBoms(player) {
  console.clear();
  const markedHits = player.hits.map((coord) => ({
    ...coord,
    mark: player.mark,
  }));
  const markedBoms = player.boms.map((coord) => ({
    ...coord,
    mark: "X",
  }));
  displayMarkersOnGrid([...markedHits, ...markedBoms]);
}

// game loop, main parts are
// * ask for current players guess (coord: { row, col })
// * registers guess in hits or boms array in player.enemy
// * displays all hits and boms in player.enemy on grid
// if game is finished displays game over rewrites displays game over
function gameLoop() {
  const maxIterations = rows * cols;
  for (let i = 0; i < maxIterations; i++) {
    let guess = promptPlayerForGuess(players.current); // ask for players guess
    registerHitOrBom(guess, players.enemy); // add guess to either enemy hits or boms array
    displayHitsAndBoms(players.enemy); // display all enemys hits and boms array
    if (hasLost(players.enemy)) {
      displayGameOver(players.current, players.enemy);
      break;
    }
    players = switchPlayers(players); // switch players
  }
}

///////////////////// game start //////////////////////////

function runGame() {
  initializeShips(player1);
  initializeShips(player2);
  gameLoop();
}

runGame();
