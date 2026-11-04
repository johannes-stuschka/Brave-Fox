const endScreenDelay = 1500;

let gameResult = null;
let gameResultTime = 0;
let gameEnded = false;


/**
 * Starts a fresh game: new world with level 1, the check for win or loss and the music.
 * stopAll() first, so a jingle from the last round does not keep playing.
 */
function startNewGame() {
  gameResult = null;
  gameResultTime = 0;
  gameEnded = false;
  init();
  setStoppableInterval(checkGameState, 100);
  soundManager.stopAll();
  soundManager.startMusic();
}


/**
 * Checks if the game is won or lost. The end screen comes after endScreenDelay,
 * so the death animation of the fox or the boss can finish first.
 */
function checkGameState() {
  if (gameEnded) {
    return;
  }
  if (!gameResult) {
    rememberGameResult();
  }
  if (gameResult && Date.now() - gameResultTime >= endScreenDelay) {
    endGame();
  }
}


/**
 * Saves the result and the time once the fox or the boss is dead.
 * The first result counts, so it can not change during the delay.
 */
function rememberGameResult() {
  if (world.character.isDead()) {
    gameResult = "lost";
  } else if (world.boss && world.boss.isDead()) {
    gameResult = "won";
  }
  if (gameResult) {
    gameResultTime = Date.now();
  }
}


/**
 * Ends the game (only once): stops everything, plays the jingle and shows the end screen.
 */
function endGame() {
  gameEnded = true;
  stopGame();
  soundManager.play(gameResult == "won" ? "win" : "game-over");
  showEndScreen();
}


/**
 * Stops the whole game: all intervals, the drawing loop of the world, all pressed keys and all sounds.
 */
function stopGame() {
  stopAllIntervals();
  world.stop();
  resetKeyBoard();
  soundManager.stopAll();
}


/**
 * Sets every key of keyBoard back to false (no key is pressed).
 */
function resetKeyBoard() {
  for (let key in keyBoard) {
    keyBoard[key] = false;
  }
}


/**
 * Shows the end screen with "You win!" or "Game over" and the collected berries.
 */
function showEndScreen() {
  let won = gameResult == "won";
  let title = document.getElementById("endTitle");
  title.textContent = won ? "You win!" : "Game over";
  title.classList.toggle("end-title-won", won);
  title.classList.toggle("end-title-lost", !won);
  document.getElementById("endStats").textContent = getBerryStats();
  showScreen("endScreen");
}


/**
 * Builds the stats line, e.g. "Berries: 7 / 15".
 * @returns {string} The collected berries of all berries in the level.
 */
function getBerryStats() {
  return "Berries: " + world.character.berries + " / " + world.berryBar.maxValue;
}


/**
 * Restart button: hides the end screen and starts a fresh game (no page reload).
 */
function restartGame() {
  hideScreen("endScreen");
  startNewGame();
}


/**
 * Home button: stops all sounds, hides the end screen and shows the start screen again.
 */
function goToHome() {
  soundManager.stopAll();
  hideScreen("endScreen");
  showScreen("startScreen");
  gameStarted = false;
}


/**
 * Shows a screen (start or end screen) above the canvas.
 * @param {string} id - The id of the screen element.
 */
function showScreen(id) {
  document.getElementById(id).classList.remove("d-none");
}


/**
 * Hides a screen and removes the focus from its button,
 * so the space key does not press that button again.
 * @param {string} id - The id of the screen element.
 */
function hideScreen(id) {
  document.activeElement.blur();
  document.getElementById(id).classList.add("d-none");
}


/**
 * X button (or key Esc): leaves the running game early. Stops intervals, the drawing loop
 * and all sounds, then shows the start screen (no page reload).
 */
function exitGame() {
  if (!gameStarted || gameEnded) {
    return;
  }
  gameEnded = true;
  stopGame();
  goToHome();
}


/**
 * Key Esc leaves the running game, like the X button.
 * @param {KeyboardEvent} event - The pressed key.
 */
function exitGameByKey(event) {
  if (event.key == "Escape") {
    exitGame();
  }
}


window.addEventListener("keydown", exitGameByKey);
