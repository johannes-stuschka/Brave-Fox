const MIN_PRESS_TIME = 100; // so lange (ms) bleibt eine Touch-Taste mindestens gedrückt, damit der Fuchs auch ganz kurze Tipper bemerkt

// Pixel-Pfeile für die Touch-Buttons: "#" = helle Farbe, "." = durchsichtig
const ARROW_RIGHT_PIXELS = [
  "...#...",
  "...##..",
  "######.",
  "#######",
  "######.",
  "...##..",
  "...#...",
];

const ARROW_UP_PIXELS = [
  "...#...",
  "..###..",
  ".#####.",
  "#######",
  "..###..",
  "..###..",
  "..###..",
];

const ARROW_COLORS = { "#": "#fff4dc" };

// Welcher Button welche Taste im keyBoard drückt
const TOUCH_BUTTONS = [
  { id: "touchLeft", key: "left" },
  { id: "touchRight", key: "right" },
  { id: "touchJump", key: "space" },
  { id: "touchThrow", key: "d" },
];

let touchPressTimes = {}; // Zeitpunkt (ms), an dem jede Touch-Taste zuletzt gedrückt wurde


/**
 * Turns a pixel pattern around from left to right (e.g. the right arrow becomes a left arrow).
 * @param {string[]} pixels - The pattern, one string per row.
 * @returns {string[]} The mirrored pattern.
 */
function mirrorPixels(pixels) {
  return pixels.map((row) => row.split("").reverse().join(""));
}


/**
 * Puts the pixel icons (arrows and the duck) into the four touch buttons.
 */
function setTouchIcons() {
  let rightArrow = createPixelImage(ARROW_RIGHT_PIXELS, ARROW_COLORS, 4);
  let leftArrow = createPixelImage(mirrorPixels(ARROW_RIGHT_PIXELS), ARROW_COLORS, 4);
  let upArrow = createPixelImage(ARROW_UP_PIXELS, ARROW_COLORS, 4);
  document.getElementById("touchLeftIcon").src = leftArrow.toDataURL();
  document.getElementById("touchRightIcon").src = rightArrow.toDataURL();
  document.getElementById("touchJumpIcon").src = upArrow.toDataURL();
  document.getElementById("touchThrowIcon").src = DUCK_IMAGE.toDataURL();
}


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
 * Sets the icons and connects all touch buttons with their keys.
 */
function initTouchControls() {
  setTouchIcons();
  TOUCH_BUTTONS.forEach((button) => registerTouchButton(document.getElementById(button.id), button.key));
}


window.addEventListener("DOMContentLoaded", initTouchControls);
