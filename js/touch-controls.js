const MIN_PRESS_TIME = 100; // so lange (ms) bleibt eine Touch-Taste mindestens gedrückt, damit der Fuchs auch ganz kurze Tipper bemerkt

// Welcher Button welche Taste im keyBoard drückt
const TOUCH_BUTTONS = [
  { id: "touchLeft", key: "left" },
  { id: "touchRight", key: "right" },
  { id: "touchJump", key: "space" },
  { id: "touchThrow", key: "d" },
];

let touchPressTimes = {}; // Zeitpunkt (ms), an dem jede Touch-Taste zuletzt gedrückt wurde


/**
 * Finger (or mouse) goes down on a touch button: the matching key counts as pressed.
 * preventDefault stops scrolling, zooming and text selection.
 * @param {PointerEvent} event - The pointerdown event.
 * @param {string} key - The key in keyBoard, e.g. "left" or "d".
 */
function pressTouchKey(event, key) {
  event.preventDefault();
  event.currentTarget.setPointerCapture(event.pointerId); // auch beim Rausrutschen kommt das "Loslassen" an
  keyBoard[key] = true;
  touchPressTimes[key] = Date.now();
}


/**
 * Finger (or mouse) leaves a touch button: the key is released after at least MIN_PRESS_TIME.
 * So even a very short tap is seen by the fox (jump or exactly one throw like the D key).
 * @param {PointerEvent} event - The pointerup or pointercancel event.
 * @param {string} key - The key in keyBoard, e.g. "left" or "d".
 */
function releaseTouchKey(event, key) {
  event.preventDefault();
  let pressTime = touchPressTimes[key];
  let waitTime = Math.max(0, MIN_PRESS_TIME - (Date.now() - pressTime));
  setTimeout(() => releaseKeyIfNotPressedAgain(key, pressTime), waitTime);
}


/**
 * Sets the key back to false, but only if the button was not pressed again in the meantime.
 * @param {string} key - The key in keyBoard.
 * @param {number} pressTime - Time (ms) of the press that is released now.
 */
function releaseKeyIfNotPressedAgain(key, pressTime) {
  if (touchPressTimes[key] == pressTime) {
    keyBoard[key] = false;
  }
}


/**
 * Connects one touch button with its key. Pointer events work for fingers and the mouse.
 * The touch events only block the browser gestures (double-tap zoom, long-press menu).
 * @param {HTMLElement} button - The touch button.
 * @param {string} key - The key in keyBoard that the button presses.
 */
function registerTouchButton(button, key) {
  button.addEventListener("pointerdown", (event) => pressTouchKey(event, key));
  button.addEventListener("pointerup", (event) => releaseTouchKey(event, key));
  button.addEventListener("pointercancel", (event) => releaseTouchKey(event, key));
  button.addEventListener("touchstart", (event) => event.preventDefault(), { passive: false });
  button.addEventListener("touchend", (event) => event.preventDefault(), { passive: false });
  button.addEventListener("touchcancel", (event) => event.preventDefault(), { passive: false });
  button.addEventListener("contextmenu", (event) => event.preventDefault());
}


/**
 * Connects all touch buttons with their keys.
 */
function initTouchControls() {
  TOUCH_BUTTONS.forEach((button) => registerTouchButton(document.getElementById(button.id), button.key));
}


window.addEventListener("DOMContentLoaded", initTouchControls);
