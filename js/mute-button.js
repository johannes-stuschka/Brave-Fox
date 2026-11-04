let soundManager = new SoundManager();

const speakerOnIcon = "./imgs/icons/speaker-on.svg";
const speakerOffIcon = "./imgs/icons/speaker-off.svg";


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
  updateIconButton("muteButton", "muteIcon", muted ? speakerOffIcon : speakerOnIcon, label, label + " (M)");
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
