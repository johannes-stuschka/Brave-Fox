// Die kurzen Soundeffekte. Jede Funktion baut einen Sound aus Tönen und Rauschen zusammen.
// Wird von generate-sounds.js geladen (node tools/generate-sounds.js).

const { createBuffer, addTone, addNoise, addNotes, normalize, noteToFrequency } = require("./generate-sounds.js");

const EFFECT_PEAK = 0.8; // lautester Wert der Effekte (1.0 wäre Übersteuerung)


/**
 * Jump: a short square tone that slides up.
 * @returns {Float32Array} The samples.
 */
function jump() {
  let buffer = createBuffer(0.2);
  addTone(buffer, { start: 0, duration: 0.18, from: 280, to: 660, wave: "square", duty: 0.25, volume: 1, decay: 6 });
  return normalize(buffer, EFFECT_PEAK);
}


/**
 * Throw: a soft whoosh (noise that swells) with a falling tone underneath.
 * @returns {Float32Array} The samples.
 */
function throwDuck() {
  let buffer = createBuffer(0.32);
  addNoise(buffer, { start: 0, duration: 0.3, brightness: 0.35, swell: true, volume: 1, attack: 0.08, release: 0.15 });
  addTone(buffer, { start: 0, duration: 0.25, from: 500, to: 220, wave: "triangle", volume: 0.25, release: 0.1 });
  return normalize(buffer, EFFECT_PEAK);
}


/**
 * Quack: a nasal, slightly flapping tone that falls a bit, with a lower tone for body.
 * @returns {Float32Array} The samples.
 */
function quack() {
  let buffer = createBuffer(0.2);
  let base = { start: 0, duration: 0.17, wave: "square", attack: 0.01, release: 0.06, vibrato: 0.06, vibratoSpeed: 30 };
  addTone(buffer, { ...base, from: 640, to: 470, duty: 0.35, volume: 1 });
  addTone(buffer, { ...base, from: 320, to: 235, duty: 0.5, volume: 0.5 });
  return normalize(buffer, EFFECT_PEAK);
}


/**
 * Berry: a fast, sparkly arpeggio going up.
 * @returns {Float32Array} The samples.
 */
function berry() {
  let buffer = createBuffer(0.4);
  let settings = { wave: "square", duty: 0.25, volume: 1, decay: 8, release: 0.02 };
  addNotes(buffer, ["E6", "G#6", "B6", "E7"], 0.05, settings);
  addTone(buffer, { ...settings, start: 0.2, duration: 0.18, from: noteToFrequency("E7"), decay: 15 });
  return normalize(buffer, EFFECT_PEAK);
}


/**
 * Hurt: a high fox yelp that drops quickly.
 * @returns {Float32Array} The samples.
 */
function hurt() {
  let buffer = createBuffer(0.26);
  let yelp = { start: 0, duration: 0.24, from: 950, to: 380, wave: "square", duty: 0.5, volume: 1, decay: 4 };
  addTone(buffer, { ...yelp, vibrato: 0.08, vibratoSpeed: 25 });
  return normalize(buffer, EFFECT_PEAK);
}


/**
 * Shot: a sharp noise burst with a deep thump.
 * @returns {Float32Array} The samples.
 */
function shot() {
  let buffer = createBuffer(0.4);
  addNoise(buffer, { start: 0, duration: 0.38, brightness: 1, volume: 1, attack: 0.001, decay: 14 });
  addTone(buffer, { start: 0, duration: 0.15, from: 160, to: 40, wave: "triangle", volume: 1, attack: 0.001 });
  return normalize(buffer, EFFECT_PEAK);
}


/**
 * Hunter dead: a wobbly tone that falls down deep.
 * @returns {Float32Array} The samples.
 */
function hunterDead() {
  let buffer = createBuffer(0.5);
  let fall = { start: 0, duration: 0.48, from: 520, to: 110, wave: "square", duty: 0.25, volume: 1, decay: 2 };
  addTone(buffer, { ...fall, vibrato: 0.05, vibratoSpeed: 12, release: 0.1 });
  addNoise(buffer, { start: 0, duration: 0.12, brightness: 0.5, volume: 0.4, decay: 20 });
  return normalize(buffer, EFFECT_PEAK);
}


/**
 * Boss alert: three low, threatening notes "dun, dun, DUNNN".
 * @returns {Float32Array} The samples.
 */
function bossAlert() {
  let buffer = createBuffer(0.9);
  let settings = { wave: "square", duty: 0.5, volume: 0.7, release: 0.04 };
  addTone(buffer, { ...settings, start: 0, duration: 0.12, from: noteToFrequency("E3") });
  addTone(buffer, { ...settings, start: 0.16, duration: 0.12, from: noteToFrequency("E3") });
  addTone(buffer, { ...settings, start: 0.32, duration: 0.55, from: noteToFrequency("A#3"), vibrato: 0.02, release: 0.2 });
  addTone(buffer, { start: 0.32, duration: 0.55, from: noteToFrequency("A#2"), wave: "triangle", volume: 1, release: 0.2 });
  return normalize(buffer, EFFECT_PEAK);
}


/**
 * Boss hurt: a deep grunt with a little noise.
 * @returns {Float32Array} The samples.
 */
function bossHurt() {
  let buffer = createBuffer(0.3);
  let grunt = { start: 0, duration: 0.28, from: 220, to: 90, wave: "square", duty: 0.5, volume: 1, decay: 3 };
  addTone(buffer, { ...grunt, vibrato: 0.1, vibratoSpeed: 20 });
  addNoise(buffer, { start: 0, duration: 0.1, brightness: 0.3, volume: 0.6, decay: 15 });
  return normalize(buffer, EFFECT_PEAK);
}


/**
 * Snore: soft breathing in (with a low rattle) and out. Starts and ends silent, so it loops smoothly.
 * @returns {Float32Array} The samples.
 */
function snore() {
  let buffer = createBuffer(2.6);
  let breathIn = { start: 0.1, duration: 1.4, attack: 0.6, release: 0.6 };
  addNoise(buffer, { ...breathIn, brightness: 0.15, swell: true, volume: 1 });
  addTone(buffer, { ...breathIn, from: 65, to: 55, wave: "triangle", volume: 0.6, vibrato: 0.3, vibratoSpeed: 18 });
  addNoise(buffer, { start: 1.6, duration: 0.9, brightness: 0.08, volume: 0.6, attack: 0.1, release: 0.7 });
  return normalize(buffer, 0.5);
}


/**
 * Win: a happy jingle that goes up and ends on a long high note.
 * @returns {Float32Array} The samples.
 */
function win() {
  let buffer = createBuffer(1.6);
  let lead = { wave: "square", duty: 0.25, volume: 0.6, release: 0.03 };
  addNotes(buffer, ["C5", "E5", "G5", "C6", "G5"], 0.12, lead);
  addTone(buffer, { ...lead, start: 0.6, duration: 0.9, from: noteToFrequency("C6"), vibrato: 0.01, release: 0.3 });
  addNotes(buffer, ["C4", "G3", "C4"], 0.5, { wave: "triangle", volume: 0.8, release: 0.1 });
  return normalize(buffer, 0.7);
}


/**
 * Game over: a sad jingle that slowly steps down.
 * @returns {Float32Array} The samples.
 */
function gameOver() {
  let buffer = createBuffer(2.1);
  let lead = { wave: "square", duty: 0.5, volume: 0.5, decay: 1.5, release: 0.05 };
  addNotes(buffer, ["G4", "F#4", "F4"], 0.35, lead);
  addTone(buffer, { ...lead, start: 1.05, duration: 1, from: noteToFrequency("E4"), vibrato: 0.03, release: 0.4 });
  addNotes(buffer, ["C3", "B2", "A#2", "A2"], 0.35, { wave: "triangle", volume: 0.8, release: 0.05 });
  return normalize(buffer, 0.7);
}


module.exports = {
  jump,
  throw: throwDuck,
  quack,
  berry,
  hurt,
  shot,
  "hunter-dead": hunterDead,
  "boss-alert": bossAlert,
  "boss-hurt": bossHurt,
  snore,
  win,
  "game-over": gameOver,
};
