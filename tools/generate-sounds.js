// Erzeugt alle Sounds des Spiels per Code (8-/16-Bit Chiptune) und speichert sie als WAV in audio/.
// Aufruf im Projektordner: node tools/generate-sounds.js  (Node.js, keine Pakete nötig)
// Die Sounds selbst stehen in sound-effects.js (Effekte) und sound-music.js (Hintergrundmusik).

const fs = require("fs");
const path = require("path");

const SAMPLE_RATE = 22050; // Samples pro Sekunde (mono, 16-Bit)
const AUDIO_FOLDER = path.join(__dirname, "..", "audio");
const EIGHTH = 0.25; // Länge einer Achtelnote in Sekunden (120 BPM)
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

let randomSeed = 12345; // fester Startwert: jeder Lauf erzeugt genau dieselben Dateien


/**
 * Small random number generator with a fixed seed (same noise on every run).
 * @returns {number} A number between 0 and 1.
 */
function random() {
  randomSeed = (randomSeed * 1103515245 + 12345) % 2147483648;
  return randomSeed / 2147483648;
}


/**
 * Converts a note name like "C5" or "F#4" into its frequency.
 * @param {string} note - Note name with octave.
 * @returns {number} Frequency in Hz (A4 = 440 Hz).
 */
function noteToFrequency(note) {
  let match = note.match(/^([A-G]#?)(\d)$/);
  let midi = 12 * (Number(match[2]) + 1) + NOTE_NAMES.indexOf(match[1]);
  return 440 * Math.pow(2, (midi - 69) / 12);
}


/**
 * Creates an empty (silent) sound.
 * @param {number} seconds - Length of the sound.
 * @returns {Float32Array} The samples, all 0.
 */
function createBuffer(seconds) {
  return new Float32Array(Math.round(seconds * SAMPLE_RATE));
}


/**
 * Returns one value of a wave form.
 * @param {string} wave - "square", "triangle" or "noise".
 * @param {number} phase - Position inside one wave, from 0 to 1.
 * @param {number} duty - For square: how long the wave stays high (0.125, 0.25 or 0.5).
 * @returns {number} Value between -1 and 1.
 */
function getWaveValue(wave, phase, duty) {
  if (wave === "square") {
    return phase < duty ? 1 : -1;
  }
  if (wave === "triangle") {
    return 1 - 4 * Math.abs(phase - 0.5);
  }
  return random() * 2 - 1;
}


/**
 * Loudness over time: fades in (attack), dies down (decay) and fades out at the end (release).
 * @param {Object} tone - The tone with duration, attack, decay and release.
 * @param {number} time - Seconds since the tone started.
 * @returns {number} Loudness factor from 0 to 1.
 */
function getEnvelope(tone, time) {
  let attack = tone.attack || 0.005;
  let release = tone.release || 0.03;
  let left = tone.duration - time;
  let fade = Math.min(1, time / attack, left / release);
  return fade * Math.exp(-time * (tone.decay || 0));
}


/**
 * Frequency at one moment: slides from "from" to "to" and can wobble (vibrato).
 * @param {Object} tone - The tone with from, to, vibrato and vibratoSpeed.
 * @param {number} time - Seconds since the tone started.
 * @returns {number} Frequency in Hz.
 */
function getFrequency(tone, time) {
  let progress = time / tone.duration;
  let to = tone.to || tone.from;
  let wobble = 1 + (tone.vibrato || 0) * Math.sin(2 * Math.PI * (tone.vibratoSpeed || 6) * time);
  return (tone.from + (to - tone.from) * progress) * wobble;
}


/**
 * Mixes one tone into the buffer. Samples after the end wrap around to the start,
 * so the music can loop without a gap.
 * @param {Float32Array} buffer - The sound to add the tone to.
 * @param {Object} tone - start, duration, from, to, wave, duty, volume and envelope values.
 */
function addTone(buffer, tone) {
  let startIndex = Math.round(tone.start * SAMPLE_RATE);
  let length = Math.round(tone.duration * SAMPLE_RATE);
  let phase = 0;
  for (let i = 0; i < length; i++) {
    let time = i / SAMPLE_RATE;
    phase = (phase + getFrequency(tone, time) / SAMPLE_RATE) % 1;
    let value = getWaveValue(tone.wave, phase, tone.duty || 0.5);
    buffer[(startIndex + i) % buffer.length] += value * getEnvelope(tone, time) * tone.volume;
  }
}


/**
 * Mixes soft or sharp noise into the buffer (for whoosh, gun shot, drums and snoring).
 * A small "brightness" makes the noise dull, 1 keeps it sharp.
 * @param {Float32Array} buffer - The sound to add the noise to.
 * @param {Object} noise - start, duration, volume, brightness and envelope values.
 */
function addNoise(buffer, noise) {
  let startIndex = Math.round(noise.start * SAMPLE_RATE);
  let length = Math.round(noise.duration * SAMPLE_RATE);
  let smooth = 0;
  for (let i = 0; i < length; i++) {
    let time = i / SAMPLE_RATE;
    let brightness = noise.brightness * (noise.swell ? Math.sin((Math.PI * i) / length) : 1);
    smooth += (brightness + 0.02) * (random() * 2 - 1 - smooth);
    buffer[(startIndex + i) % buffer.length] += smooth * getEnvelope(noise, time) * noise.volume;
  }
}


/**
 * Plays a list of notes one after another with the same sound settings.
 * @param {Float32Array} buffer - The sound to add the notes to.
 * @param {string[]} notes - Note names like "C5".
 * @param {number} noteLength - Seconds per note.
 * @param {Object} settings - wave, duty, volume and envelope values for every note.
 */
function addNotes(buffer, notes, noteLength, settings) {
  notes.forEach((note, index) => {
    let start = (settings.start || 0) + index * noteLength;
    addTone(buffer, { ...settings, start, duration: noteLength, from: noteToFrequency(note) });
  });
}


/**
 * Scales the sound so its loudest sample is exactly "peak" (no clipping, same loudness).
 * @param {Float32Array} buffer - The sound.
 * @param {number} peak - Wanted loudest value, e.g. 0.8.
 * @returns {Float32Array} The same buffer, now scaled.
 */
function normalize(buffer, peak) {
  let loudest = buffer.reduce((max, value) => Math.max(max, Math.abs(value)), 0);
  let factor = loudest > 0 ? peak / loudest : 1;
  return buffer.map((value) => value * factor);
}


/**
 * Removes the deep part of the sound (simple high-pass filter at 500 Hz).
 * Our ears hear deep tones as quieter, so this is closer to how loud a sound feels.
 * @param {Float32Array} buffer - The sound.
 * @returns {Float32Array} A new buffer without the deep part.
 */
function removeBass(buffer) {
  let keep = 1 / (1 + 2 * Math.PI * 500 / SAMPLE_RATE);
  let result = new Float32Array(buffer.length);
  let previousInput = 0;
  let previousOutput = 0;
  buffer.forEach((value, index) => {
    previousOutput = keep * (previousOutput + value - previousInput);
    previousInput = value;
    result[index] = previousOutput;
  });
  return result;
}


/**
 * Measures how loud a sound feels: the loudest 0.1-second part (RMS, deep tones count less).
 * @param {Float32Array} buffer - The sound.
 * @returns {number} Felt loudness, e.g. 0.15.
 */
function measureLoudness(buffer) {
  let samples = removeBass(buffer);
  let window = Math.round(0.1 * SAMPLE_RATE);
  let loudest = 0;
  for (let start = 0; start + window <= samples.length; start += Math.round(window / 4)) {
    let part = samples.subarray(start, start + window);
    let energy = part.reduce((sum, value) => sum + value * value, 0);
    loudest = Math.max(loudest, Math.sqrt(energy / window));
  }
  return loudest;
}


/**
 * Scales the sound so it feels as loud as "target" (square waves and noise are turned down more than soft tones).
 * @param {Float32Array} buffer - The sound.
 * @param {number} target - Wanted felt loudness from measureLoudness, e.g. 0.15.
 * @returns {Float32Array} The same sound, now scaled.
 */
function normalizeLoudness(buffer, target) {
  let factor = target / measureLoudness(buffer);
  return buffer.map((value) => value * factor);
}


/**
 * Writes the 44-byte RIFF/WAVE header for mono 16-bit PCM.
 * @param {Buffer} file - The file bytes.
 * @param {number} dataSize - Number of bytes of the samples.
 */
function writeWavHeader(file, dataSize) {
  file.write("RIFF", 0);
  file.writeUInt32LE(36 + dataSize, 4);
  file.write("WAVEfmt ", 8);
  file.writeUInt32LE(16, 16); // Größe des fmt-Blocks
  file.writeUInt16LE(1, 20); // 1 = PCM (unkomprimiert)
  file.writeUInt16LE(1, 22); // 1 Kanal (mono)
  file.writeUInt32LE(SAMPLE_RATE, 24);
  file.writeUInt32LE(SAMPLE_RATE * 2, 28); // Bytes pro Sekunde
  file.writeUInt16LE(2, 32); // Bytes pro Sample
  file.writeUInt16LE(16, 34); // Bits pro Sample
  file.write("data", 36);
  file.writeUInt32LE(dataSize, 40);
}


/**
 * Saves the samples as a WAV file in the audio folder.
 * @param {string} name - File name without ".wav".
 * @param {Float32Array} buffer - Samples between -1 and 1.
 */
function writeWav(name, buffer) {
  let file = Buffer.alloc(44 + buffer.length * 2);
  writeWavHeader(file, buffer.length * 2);
  buffer.forEach((value, index) => {
    let sample = Math.max(-1, Math.min(1, value));
    file.writeInt16LE(Math.round(sample * 32767), 44 + index * 2);
  });
  fs.writeFileSync(path.join(AUDIO_FOLDER, name + ".wav"), file);
}


module.exports = { createBuffer, addTone, addNoise, addNotes, normalize, normalizeLoudness, noteToFrequency, EIGHTH };

if (require.main === module) {
  fs.mkdirSync(AUDIO_FOLDER, { recursive: true });
  let sounds = { ...require("./sound-effects.js"), ...require("./sound-music.js") };
  for (let name in sounds) {
    writeWav(name, sounds[name]());
  }
}
