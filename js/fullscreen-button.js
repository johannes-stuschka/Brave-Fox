// Ecken-Icons für den Vollbild-Button: "größer" (Vollbild an) und "kleiner" (Vollbild aus)
const FULLSCREEN_ENTER_ICON = "./imgs/icons/fullscreen-enter.svg";
const FULLSCREEN_EXIT_ICON = "./imgs/icons/fullscreen-exit.svg";


/**
 * Checks if the browser can show an element in fullscreen.
 * Safari uses the older "webkit" names, the iPhone cannot do it at all.
 * @returns {boolean} True if fullscreen is possible.
 */
function isFullscreenSupported() {
  return Boolean(document.fullscreenEnabled || document.webkitFullscreenEnabled);
}


/**
 * Finds the element that is in fullscreen right now.
 * @returns {Element|null} The fullscreen element, or null if nothing is in fullscreen.
 */
function getFullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}


/**
 * Shows an element in fullscreen (with the webkit name as fallback for Safari).
 * @param {HTMLElement} element - The element that should fill the screen.
 */
function enterFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else {
    element.webkitRequestFullscreen();
  }
}


/**
 * Leaves the fullscreen (with the webkit name as fallback for Safari).
 */
function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else {
    document.webkitExitFullscreen();
  }
}


/**
 * Fullscreen button: puts the game into fullscreen or back into the normal window.
 * The button loses the focus, so Space jumps instead of pressing it again.
 */
function toggleFullscreen() {
  if (getFullscreenElement()) {
    exitFullscreen();
  } else {
    enterFullscreen(document.querySelector(".game-container"));
  }
  document.getElementById("fullscreenButton").blur();
}


/**
 * Shows the "bigger" corners or the "smaller" corners, depending on the fullscreen state.
 */
function updateFullscreenButton() {
  let isFullscreen = getFullscreenElement() != null;
  let label = isFullscreen ? "Exit fullscreen" : "Fullscreen";
  let button = document.getElementById("fullscreenButton");
  document.getElementById("fullscreenIcon").src = isFullscreen ? FULLSCREEN_EXIT_ICON : FULLSCREEN_ENTER_ICON;
  button.setAttribute("aria-label", label);
  button.title = label;
}


/**
 * Hides the button where fullscreen is not possible, otherwise sets the icon.
 * The icon also changes when the player leaves the fullscreen with Esc.
 */
function initFullscreenButton() {
  if (!isFullscreenSupported()) {
    document.getElementById("fullscreenButton").classList.add("d-none");
    return;
  }
  updateFullscreenButton();
  document.addEventListener("fullscreenchange", updateFullscreenButton);
  document.addEventListener("webkitfullscreenchange", updateFullscreenButton);
}


window.addEventListener("DOMContentLoaded", initFullscreenButton);
