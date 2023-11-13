///////////// Helper functions //////////////////

// Creates a string from of object
Object.prototype.toString = function () {
  let objStr = "{\n";
  const keys = Object.keys(this);
  for (let key of keys) {
    objStr += `   ${key}: ${this[key]},\n`;
  }
  objStr += "}";
  return objStr;
};

let testCount = 1;

function expect(output, expected) {
  const expectedStr = isObject(expected) ? expected.toString() : expected;
  // Compare through simple object equality (i.e obj.equals(otherObj))
  if (isObject(output) && !output.equals(expected)) {
    throw `Expected ${expectedStr} but received ${output.toString()}.`;
    // Compare through simple equality (1 === 3)
  } else if (isPrimitive(output) && output !== expected) {
    throw `Expected ${expectedStr} but received ${output}.`;
  }
}

function test(desc, run) {
  const log = {
    method: "log",
    message: [
      "%c ✅ Test %d passed: %s",
      "font-size:10px; color:green;",
      testCount,
      desc,
    ],
  };
  try {
    run(); // Run test (if any of the "expect" functions inside throws error it will be catched below)
  } catch (error) {
    log.method = "error";
    log.message = [`💩 Test %d failed: ${desc}\n`, testCount, error];
  }
  testCount++;
  console[log.method](...log.message);
}

////////////// Run tests ///////////////////

function sum(x, y) {
  return x + y;
}

// example
test("1 + 2 should be 3", function () {
  expect(sum(1, 2), 3);
});

test("Object.prototype.equals should work on simple objects", function () {
  const obj = { name: "Berit", age: 98 };
  expect(obj.equals({ name: "Berit", age: 98 }), true);
  expect(obj.equals({ name: "Berit" }), false);
  expect(obj.equals({ name: "Bengt", age: 38 }), false);
  expect(
    obj.equals({ name: "Berit", age: 98, adress: "Södervägen 19" }),
    false
  );
});

test("Object.prototype.equals should work on avanced objects", function () {
  const obj = {
    name: { first: "Berit", last: "Andersson" },
    address: { name: "Ballefjongberga 18", code: 41457 },
  };
  expect(
    obj.equals({
      name: { first: "Berit", last: "Andersson" },
      address: { name: "Ballefjongberga 18", code: 41457 },
    }),
    true
  );
  expect(
    obj.equals({
      name: { first: "Berit", last: "Larsson" },
      address: { name: "Ballefjongberga 18", code: 41457 },
    }),
    false
  );
  expect(
    obj.equals({
      name: { first: "Berit", last: "Andersson" },
      address: { name: "Ballefjongberga 18" },
    }),
    false
  );
});

test("Array.prototype.contains should work on numbers", function () {
  expect([1, 2, 3].contains(2), true);
  expect([1, 2, 3].contains(4), false);
});

test("Array.prototype.contains should work on booleans", function () {
  expect([true, false, true].contains(true), true);
  expect([false, false, false].contains(true), false);
});

test("Array.prototype.contains should work on strings", function () {
  expect(["hej", "hopp", "trallalala"].contains("hopp"), true);
  expect(["hej", "hopp", "trallalala"].contains("whoopsi"), false);
});

test("Array.prototype.contains should work on objects", function () {
  expect(
    [
      { row: 1, col: 2 },
      { row: 8, col: 9 },
    ].contains({ row: 77, col: 88 }),
    false
  );
  expect(
    [
      { row: 1, col: 2 },
      { row: 3, col: 4 },
    ].contains({ row: 3, col: 4 }),
    true
  );
});

test("isValidCoord should work only on objects with format { row, col }", function () {
  expect(isValidCoord({ fel: 1, col: 1 }), false);
  expect(isValidCoord({ row: 1, fel: 1 }), false);
  expect(isValidCoord({ row: 1, col: 1 }), true);
});

test("isValidCoord should work only on numbers", function () {
  expect(isValidCoord({ row: false, col: 1 }), false);
  expect(isValidCoord({ row: 1, col: "fel" }), false);
  expect(isValidCoord({ row: 1, col: 1 }), true);
});

test("isValidCoord should work only on numbers in range", function () {
  expect(isValidCoord({ row: 1000, col: 1 }), false);
  expect(isValidCoord({ row: 1, col: 10 }), false);
  expect(isValidCoord({ row: 1, col: 9 }), true);
});

test("isValidShip should only validate ships in straight lines", function () {
  expect(
    isValidShip([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ]),
    true
  );
  expect(
    isValidShip([
      { row: 9, col: 7 },
      { row: 9, col: 8 },
      { row: 9, col: 9 },
    ]),
    true
  );
  expect(
    isValidShip([
      { row: 0, col: 0 },
      { row: 1, col: 1 },
      { row: 0, col: 2 },
    ]),
    false
  );
  expect(
    isValidShip([
      { row: 9, col: 7 },
      { row: 8, col: 8 },
      { row: 9, col: 9 },
    ]),
    false
  );
});

test("isValidShip should only validate ships >= 2 cells and <= 5 cells", function () {
  expect(
    isValidShip([
      { row: 9, col: 7 },
      { row: 9, col: 8 },
      { row: 9, col: 9 },
    ]),
    true
  );
  expect(isValidShip([{ row: 9, col: 7 }]), false);
  expect(
    isValidShip([
      { row: 9, col: 3 },
      { row: 9, col: 4 },
      { row: 9, col: 5 },
      { row: 9, col: 6 },
      { row: 9, col: 7 },
      { row: 9, col: 8 }, // too many coords
    ]),
    false
  );
  expect(isValidShip([{ row: 9, col: 3 }]), false);
});

test("isValidShip should only validate ships with coordinates inside board ", function () {
  expect(
    isValidShip([
      { row: 9, col: 7 },
      { row: 9, col: 8 },
      { row: 9, col: 9 },
      { row: 9, col: 10 }, // outside boundary, error
    ]),
    false
  );
  expect(
    isValidShip([
      { row: -1, col: 7 },
      { row: -1, col: 8 },
      { row: -1, col: 9 },
    ]),
    false
  );
  expect(
    isValidShip([
      { row: 0, col: 7 },
      { row: 0, col: 8 },
      { row: 0, col: 9 },
    ]),
    true
  );
});

test("markCoord should add mark property to coordinate object", function () {
  expect(markCoord({ row: 1, col: 1 }, "X"), { row: 1, col: 1, mark: "X" });
  expect(markCoord({}, "1"), { mark: "1" });
  expect(markCoord({}, "2"), { mark: "2" });
});

test("hasLost should tell if player has all the ships coordinates are hit", function () {
  const player = {
    mark: 1,
    ships: [
      { row: 1, col: 2 },
      { row: 1, col: 3 },
      { row: 1, col: 4 },
      { row: 6, col: 8 },
      { row: 7, col: 8 },
      { row: 8, col: 8 },
      { row: 9, col: 8 },
    ],
    hits: [],
  };
  expect(hasLost(player), false);
  player.hits = [
    { row: 1, col: 2 },
    { row: 1, col: 3 },
    { row: 1, col: 4 },
    { row: 6, col: 8 },
    { row: 7, col: 8 },
    { row: 8, col: 8 },
    { row: 9, col: 8 },
  ];
  expect(hasLost(player), true);
});

test("switchPlayers should make current to enemy and enemy to current in players object", function () {
  const players = {
    current: { mark: 1, ships: [], hits: [] },
    enemy: { mark: 2, ships: [], hits: [] },
  };
  expect(switchPlayers(players), {
    current: { mark: 2, ships: [], hits: [] },
    enemy: { mark: 1, ships: [], hits: [] },
  });
});

test("registerHitOrBom should add guess to correct array, either hits or boms", function () {
  const player = {
    mark: 1,
    boms: [],
    hits: [],
    ships: [
      { row: 1, col: 1 },
      { row: 1, col: 2 },
      { row: 1, col: 3 },
    ],
  };
  registerHitOrBom({ row: 1, col: 2 }, player); // hit
  registerHitOrBom({ row: 1, col: 3 }, player); // hit
  registerHitOrBom({ row: 5, col: 5 }, player); // bom
  expect(player.hits, [
    { row: 1, col: 2 },
    { row: 1, col: 3 },
  ]);
  expect(player.boms, [{ row: 5, col: 5 }]);
});
