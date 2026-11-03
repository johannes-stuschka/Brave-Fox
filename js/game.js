let world;

const SHOW_HITBOXES = false; // true zeigt die Hitboxen als Rahmen (zum Einstellen der offsets)

let keyBoard = {
  left: false,
  right: false,
  space: false,
  d: false,
};

const KEY_NAMES = { ArrowLeft: "left", ArrowRight: "right", d: "d", D: "d" }; // welche Taste welchen Eintrag in keyBoard setzt

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


/**
 * Saves in keyBoard whether one of the game keys was pressed or released.
 * KEY_NAMES tells which keyBoard entry belongs to which key (Space is checked by its code).
 * @param {KeyboardEvent} event - The keydown or keyup event.
 * @param {boolean} isPressed - true on keydown, false on keyup.
 */
function setKey(event, isPressed) {
  if (event.code == "Space") {
    keyBoard.space = isPressed;
  }
  let name = KEY_NAMES[event.key];
  if (name) {
    keyBoard[name] = isPressed;
  }
}


/**
 * Key pressed: the Space key must not scroll the page while jumping.
 * @param {KeyboardEvent} event - The keydown event.
 */
function onKeyDown(event) {
  if (event.code == "Space") {
    event.preventDefault();
  }
  setKey(event, true);
}


/**
 * Key released: the key counts as not pressed any more.
 * @param {KeyboardEvent} event - The keyup event.
 */
function onKeyUp(event) {
  setKey(event, false);
}

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
