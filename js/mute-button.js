let soundManager = new SoundManager();

// Pixel-Lautsprecher für den Mute-Button: "#" = hell, "o" = dunkler Rand, "w" = Schallwellen, "x" = rotes Kreuz
const SPEAKER_ON_PIXELS = [
  "....oo......",
  "...o#o...w..",
  "ooo##o.w..w.",
  "o####o..w.w.",
  "o####o..w.w.",
  "ooo##o.w..w.",
  "...o#o...w..",
  "....oo......",
];

const SPEAKER_OFF_PIXELS = [
  "....oo......",
  "...o#o......",
  "ooo##o.x...x",
  "o####o..x.x.",
  "o####o...x..",
  "ooo##o..x.x.",
  "...o#o.x...x",
  "....oo......",
];

const SPEAKER_COLORS = { "#": "#fff4dc", o: "#2b1d10", w: "#fff4dc", x: "#e05a3a" };
const SPEAKER_ON_URL = createPixelImage(SPEAKER_ON_PIXELS, SPEAKER_COLORS, 3).toDataURL();
const SPEAKER_OFF_URL = createPixelImage(SPEAKER_OFF_PIXELS, SPEAKER_COLORS, 3).toDataURL();


/**
 * Mute button (or key M): turns all sounds off or on and shows the new state.
 * The button loses the focus, so Space jumps instead of pressing it again.
 */
function toggleMute() {
  soundManager.setMuted(!soundManager.muted);
  updateMuteButton();
  document.getElementById("muteButton").blur();
}


/**
 * Shows the speaker with waves (sound on) or with a red cross (sound off).
 */
function updateMuteButton() {
  let muted = soundManager.muted;
  let label = muted ? "Sound on" : "Sound off";
  let button = document.getElementById("muteButton");
  document.getElementById("muteIcon").src = muted ? SPEAKER_OFF_URL : SPEAKER_ON_URL;
  button.setAttribute("aria-label", label);
  button.title = label + " (M)";
}


/**
 * Key M toggles the sound. Holding the key down does not toggle again and again.
 * @param {KeyboardEvent} event - The pressed key.
 */
function toggleMuteByKey(event) {
  if ((event.key == "m" || event.key == "M") && !event.repeat) {
    toggleMute();
  }
}


window.addEventListener("DOMContentLoaded", updateMuteButton);
window.addEventListener("keydown", toggleMuteByKey);
