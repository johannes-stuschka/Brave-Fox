const END_SCREEN_DELAY = 1500; // so lange (ms) läuft die Sterbe-Animation, bevor der Endbildschirm kommt

let gameResult = null; // "won" oder "lost", sobald Fuchs oder Boss tot ist
let gameResultTime = 0; // Zeitpunkt (ms), an dem das Ergebnis feststand
let gameEnded = false; // true, sobald der Endbildschirm gezeigt wurde


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
 * Checks if the game is won or lost. The end screen comes after END_SCREEN_DELAY,
 * so the death animation of the fox or the boss can finish first.
 */
function checkGameState() {
  if (gameEnded) {
    return;
  }
  if (!gameResult) {
    rememberGameResult();
  }
  if (gameResult && Date.now() - gameResultTime >= END_SCREEN_DELAY) {
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
  document.getElementById("endScreen").classList.remove("d-none");
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
  document.activeElement.blur(); // sonst würde die Leertaste den Button nochmal drücken
  document.getElementById("endScreen").classList.add("d-none");
  startNewGame();
}


/**
 * Home button: stops all sounds, hides the end screen and shows the start screen again.
 */
function goToHome() {
  soundManager.stopAll();
  document.activeElement.blur();
  document.getElementById("endScreen").classList.add("d-none");
  document.getElementById("startScreen").classList.remove("d-none");
  gameStarted = false; // damit der Start-Button wieder ein Spiel starten kann
}
