let world;

const SHOW_HITBOXES = false; // true zeigt die Hitboxen als Rahmen (zum Einstellen der offsets)

let keyBoard = {
  left: false,
  right: false,
  shift: false,
  space: false,
  d: false,
};

let intervalIds = [];

/**
 * Starts an interval and remembers its id so it can be stopped later.
 * @param {Function} fn - Function that runs on every interval tick.
 * @param {number} ms - Time between two ticks in milliseconds.
 * @returns {number} The id of the new interval.
 */
function setStoppableInterval(fn, ms) {
  let id = setInterval(fn, ms);
  intervalIds.push(id);
  return id;
}


/**
 * Stops all intervals started with setStoppableInterval (e.g. for a restart).
 */
function stopAllIntervals() {
  intervalIds.forEach((id) => clearInterval(id));
  intervalIds = [];
}


/**
 * Creates the game world with level 1 on the canvas.
 */
function init() {
  let canvas = document.getElementById("canvas");
  world = new World(canvas, createLevel1());
}

window.addEventListener("keydown", (event) => {
  if (event.key == "ArrowLeft") {
    keyBoard.left = true;
  }
  if (event.key == "ArrowRight") {
    keyBoard.right = true;
  }
  if (event.key == "Shift") {
    keyBoard.shift = true;
  }
  if (event.code == "Space") {
    event.preventDefault(); // Seite soll beim Springen nicht scrollen
    keyBoard.space = true;
  }
  if (event.key == "d" || event.key == "D") {
    keyBoard.d = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key == "ArrowLeft") {
    keyBoard.left = false;
  }
  if (event.key == "ArrowRight") {
    keyBoard.right = false;
  }
  if (event.key == "Shift") {
    keyBoard.shift = false;
  }
  if (event.code == "Space") {
    keyBoard.space = false;
  }
  if (event.key == "d" || event.key == "D") {
    keyBoard.d = false;
  }
});
