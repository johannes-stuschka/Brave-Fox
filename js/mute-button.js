let soundManager = new SoundManager();

// Lautsprecher-Icons für den Mute-Button: mit Schallwellen (Ton an) und mit rotem Kreuz (Ton aus)
const SPEAKER_ON_ICON = "./imgs/icons/speaker-on.svg";
const SPEAKER_OFF_ICON = "./imgs/icons/speaker-off.svg";


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
  document.getElementById("muteIcon").src = muted ? SPEAKER_OFF_ICON : SPEAKER_ON_ICON;
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
