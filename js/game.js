let world;

let keyBoard = {
  left: false,
  right: false,
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
 * Creates the game world on the canvas.
 */
function init() {
  let canvas = document.getElementById("canvas");
  world = new World(canvas);
}

window.addEventListener("keydown", (event) => {
  if (event.key == "ArrowLeft") {
    keyBoard.left = true;
  }
  if (event.key == "ArrowRight") {
    keyBoard.right = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key == "ArrowLeft") {
    keyBoard.left = false;
  }
  if (event.key == "ArrowRight") {
    keyBoard.right = false;
  }
});
