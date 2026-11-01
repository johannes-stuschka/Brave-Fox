// Die Hintergrundmusik: ein fröhlicher Wald-Chiptune, 12 Takte (24 Sekunden), läuft nahtlos im Kreis.
// Wird von generate-sounds.js geladen (node tools/generate-sounds.js).

const { createBuffer, addTone, addNoise, normalize, noteToFrequency, EIGHTH } = require("./generate-sounds.js");

const BAR = 8 * EIGHTH; // ein Takt = 8 Achtel = 2 Sekunden

// Ein Akkord pro Takt. Der letzte Takt (G) führt wieder zum ersten (C) zurück.
const CHORDS = ["C", "G", "Am", "F", "C", "G", "F", "G", "Am", "F", "C", "G"];

const CHORD_NOTES = {
  C: ["C", "E", "G"],
  G: ["G", "B", "D"],
  Am: ["A", "C", "E"],
  F: ["F", "A", "C"],
};

// Melodie: ein Eintrag pro Achtel. "-" = vorherige Note klingt weiter, "." = Pause.
const MELODY = [
  "E5 - G5 - C6 - G5 E5",
  "D5 - B4 - G4 - B4 D5",
  "C5 - E5 - A5 - G5 E5",
  "F5 - E5 D5 C5 - A4 -",
  "C5 E5 G5 C6 - G5 E5 G5",
  "B4 D5 G5 B5 - G5 D5 B4",
  "A4 C5 F5 A5 - F5 C5 A4",
  "B4 - D5 - G5 - F5 -",
  "A5 - E5 - C5 - E5 A5",
  "C6 - A5 - F5 - A5 C6",
  "G5 - E5 C5 E5 G5 C6 -",
  "B5 - G5 - D5 - . .",
];


/**
 * Turns one bar of the melody text into notes with start time and length.
 * @param {string} barText - e.g. "E5 - G5 - C6 - G5 E5".
 * @param {number} barStart - Start of the bar in seconds.
 * @returns {Array<{note: string, start: number, length: number}>} The notes of this bar.
 */
function parseMelodyBar(barText, barStart) {
  let notes = [];
  barText.split(" ").forEach((token, index) => {
    if (token === "-" && notes.length > 0) {
      notes[notes.length - 1].length += EIGHTH;
    } else if (token !== "-" && token !== ".") {
      notes.push({ note: token, start: barStart + index * EIGHTH, length: EIGHTH });
    }
  });
  return notes;
}


/**
 * Adds the melody: a bright square wave with a tiny vibrato.
 * @param {Float32Array} buffer - The music.
 */
function addMelody(buffer) {
  MELODY.forEach((barText, barIndex) => {
    parseMelodyBar(barText, barIndex * BAR).forEach((item) => {
      let tone = { start: item.start, duration: item.length * 0.9, from: noteToFrequency(item.note) };
      addTone(buffer, { ...tone, wave: "square", duty: 0.25, volume: 0.32, vibrato: 0.004, decay: 1.5 });
    });
  });
}


/**
 * Adds the bass: the root note of the chord on every eighth, jumping between low and high.
 * @param {Float32Array} buffer - The music.
 */
function addBass(buffer) {
  CHORDS.forEach((chord, barIndex) => {
    let root = CHORD_NOTES[chord][0];
    for (let step = 0; step < 8; step++) {
      let octave = step % 2 === 0 ? 2 : 3;
      let start = barIndex * BAR + step * EIGHTH;
      addTone(buffer, { start, duration: EIGHTH * 0.85, from: noteToFrequency(root + octave), wave: "triangle", volume: 0.55 });
    }
  });
}


/**
 * Adds a quiet, fast arpeggio (the chord notes one after another in sixteenths).
 * @param {Float32Array} buffer - The music.
 */
function addArpeggio(buffer) {
  CHORDS.forEach((chord, barIndex) => {
    let notes = CHORD_NOTES[chord];
    for (let step = 0; step < 16; step++) {
      let start = barIndex * BAR + (step * EIGHTH) / 2;
      let frequency = noteToFrequency(notes[step % 3] + 4);
      addTone(buffer, { start, duration: EIGHTH / 2, from: frequency, wave: "square", duty: 0.125, volume: 0.1, decay: 12 });
    }
  });
}


/**
 * Adds the drums: kick on beat 1 and 3, snare on beat 2 and 4, soft hi-hat in between.
 * @param {Float32Array} buffer - The music.
 */
function addDrums(buffer) {
  let eighths = CHORDS.length * 8;
  for (let step = 0; step < eighths; step++) {
    let start = step * EIGHTH;
    if (step % 4 === 0) {
      addTone(buffer, { start, duration: 0.12, from: 150, to: 45, wave: "triangle", volume: 0.7, attack: 0.001 });
    } else if (step % 4 === 2) {
      addNoise(buffer, { start, duration: 0.12, brightness: 0.6, volume: 0.25, attack: 0.001, decay: 25 });
    }
    addNoise(buffer, { start: start + EIGHTH / 2, duration: 0.03, brightness: 1, volume: 0.08, attack: 0.001 });
  }
}


/**
 * Builds the whole music loop.
 * @returns {Float32Array} The samples.
 */
function music() {
  let buffer = createBuffer(CHORDS.length * BAR);
  addBass(buffer);
  addArpeggio(buffer);
  addDrums(buffer);
  addMelody(buffer);
  return normalize(buffer, 0.7);
}


module.exports = { music };
