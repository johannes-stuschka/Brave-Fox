const SOUND_NAMES = [
  "jump",
  "throw",
  "quack",
  "berry",
  "hurt",
  "shot",
  "hunter-dead",
  "boss-alert",
  "boss-hurt",
  "win",
  "game-over",
];

/**
 * Loads and plays all sounds and the music and remembers the mute setting.
 */
class SoundManager {
  storageKey = "braveFoxMuted"; // unter diesem Namen merkt sich der Browser, ob der Ton aus ist
  musicVolume = 0.35; // die Musik ist die gleichmäßige Grundlautstärke
  // Lautstärke pro Effekt: alle Dateien sind gleich laut erzeugt, hier liegen sie hörbar unter der Musik.
  // Kurze, harte Sounds (Sprung, Schuss, Treffer) sind am leisesten, die Jingles etwa so laut wie die Musik.
  volumes = {
    jump: 0.11,
    throw: 0.12,
    quack: 0.16,
    berry: 0.15,
    hurt: 0.1,
    shot: 0.1,
    "hunter-dead": 0.13,
    "boss-alert": 0.16,
    "boss-hurt": 0.13,
    win: 0.2,
    "game-over": 0.2,
    snore: 0.18,
  };
  muted = false;
  musicWanted = false; // soll die Musik gerade laufen (wenn der Ton an ist)?
  effects = {}; // vorgeladene Effekte, z.B. effects.jump
  playingEffects = []; // Kopien der Effekte, die gerade klingen
  loops = {}; // Sounds, die sich wiederholen, z.B. loops.snore
  activeLoops = []; // Namen der Loops, die gerade laufen sollen
  music;

  /**
   * Preloads music, effects and the snore loop and reads the saved mute setting.
   */
  constructor() {
    this.music = this.createAudio("music", this.musicVolume, true);
    SOUND_NAMES.forEach((name) => {
      this.effects[name] = this.createAudio(name, this.volumes[name], false);
    });
    this.loops.snore = this.createAudio("snore", this.volumes.snore, true);
    this.muted = this.loadMuted();
  }


  /**
   * Creates one preloaded audio element for a file in the audio folder.
   * @param {string} name - File name without ".wav".
   * @param {number} volume - Loudness from 0 to 1.
   * @param {boolean} loop - True if the sound should repeat forever.
   * @returns {HTMLAudioElement} The audio element.
   */
  createAudio(name, volume, loop) {
    let audio = new Audio("./audio/" + name + ".wav");
    audio.preload = "auto";
    audio.volume = volume;
    audio.loop = loop;
    return audio;
  }


  /**
   * Starts an audio element. Errors (e.g. the browser blocks sound before the first click) are ignored.
   * @param {HTMLAudioElement} audio - The sound to start.
   */
  startAudio(audio) {
    audio.play().catch(() => {});
  }


  /**
   * Plays a short effect with its own volume from "volumes".
   * A copy is played, so the same effect can sound several times at once.
   * @param {string} name - Name of the effect, e.g. "jump".
   */
  play(name) {
    if (this.muted) {
      return;
    }
    let sound = this.effects[name].cloneNode();
    sound.volume = this.volumes[name];
    sound.addEventListener("ended", () => this.forgetEffect(sound));
    this.playingEffects.push(sound);
    this.startAudio(sound);
  }


  /**
   * Removes a finished effect from the list of playing effects.
   * @param {HTMLAudioElement} sound - The effect that ended.
   */
  forgetEffect(sound) {
    this.playingEffects = this.playingEffects.filter((item) => item !== sound);
  }


  /**
   * Stops all effects that are still sounding.
   */
  stopEffects() {
    this.playingEffects.forEach((sound) => sound.pause());
    this.playingEffects = [];
  }


  /**
   * Starts the background music from the beginning (only one music at a time).
   */
  startMusic() {
    this.musicWanted = true;
    this.music.currentTime = 0;
    if (!this.muted) {
      this.startAudio(this.music);
    }
  }


  /**
   * Stops the background music and rewinds it.
   */
  stopMusic() {
    this.musicWanted = false;
    this.music.pause();
    this.music.currentTime = 0;
  }


  /**
   * Starts a repeating sound (e.g. "snore"). Calling it again while it runs does nothing.
   * @param {string} name - Name of the loop.
   */
  startLoop(name) {
    if (this.activeLoops.includes(name)) {
      return;
    }
    this.activeLoops.push(name);
    this.loops[name].currentTime = 0;
    if (!this.muted) {
      this.startAudio(this.loops[name]);
    }
  }


  /**
   * Stops a repeating sound. Does nothing if it is not running.
   * @param {string} name - Name of the loop.
   */
  stopLoop(name) {
    if (!this.activeLoops.includes(name)) {
      return;
    }
    this.activeLoops = this.activeLoops.filter((item) => item !== name);
    this.loops[name].pause();
  }


  /**
   * Stops every sound: music, loops and effects.
   */
  stopAll() {
    this.stopMusic();
    [...this.activeLoops].forEach((name) => this.stopLoop(name));
    this.stopEffects();
  }


  /**
   * Turns the sound off or on and saves the choice.
   * Muting silences everything at once, unmuting continues music and loops that should run.
   * @param {boolean} muted - True turns the sound off.
   */
  setMuted(muted) {
    this.muted = muted;
    this.saveMuted();
    if (muted) {
      this.pauseEverything();
    } else {
      this.resumeWanted();
    }
  }


  /**
   * Pauses music and loops (they can continue later) and stops all effects.
   */
  pauseEverything() {
    this.music.pause();
    this.activeLoops.forEach((name) => this.loops[name].pause());
    this.stopEffects();
  }


  /**
   * Continues the music and the loops that should be running right now.
   */
  resumeWanted() {
    if (this.musicWanted) {
      this.startAudio(this.music);
    }
    this.activeLoops.forEach((name) => this.startAudio(this.loops[name]));
  }


  /**
   * Reads the saved mute setting. If localStorage is not available, the sound is on.
   * @returns {boolean} True if the sound was turned off last time.
   */
  loadMuted() {
    try {
      return localStorage.getItem(this.storageKey) === "true";
    } catch (error) {
      return false;
    }
  }


  /**
   * Saves the mute setting, so it is still the same after a reload.
   */
  saveMuted() {
    try {
      localStorage.setItem(this.storageKey, String(this.muted));
    } catch (error) {
      // ohne localStorage (z.B. privater Modus) gilt die Einstellung nur bis zum Neuladen
    }
  }
}
