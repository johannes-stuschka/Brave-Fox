let gameStarted = false;

/**
 * Hides the start screen and starts the game.
 * gameStarted blocks a second start until goToHome() shows the start screen again.
 */
function startGame() {
  if (gameStarted) {
    return;
  }
  gameStarted = true;
  hideScreen("startScreen");
  startNewGame();
}

/**
 * Opens the "How to play" dialog as a modal.
 */
function openInfoDialog() {
  document.getElementById("infoDialog").showModal();
}

/**
 * Closes the "How to play" dialog.
 */
function closeInfoDialog() {
  document.getElementById("infoDialog").close();
}

/**
 * Closes the dialog when the click hit the dark backdrop around it.
 * Clicks inside the content box hit the inner div, not the dialog itself.
 * @param {MouseEvent} event - The click event on the dialog.
 */
function closeInfoDialogOnBackdrop(event) {
  if (event.target.id == "infoDialog") {
    closeInfoDialog();
  }
}
