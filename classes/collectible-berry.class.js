// Pixel-Beeren (3 Waldbeeren mit Stiel und Blättern): "G" = dunkles Blatt, "g" = helles Blatt,
// "n" = Stiel, "o" = Rand, "r" = Rot, "d" = Schatten auf der Beere, "w" = Glanzpunkt,
// "s" = Schatten auf dem Boden, "." = durchsichtig
const BERRY_PIXELS = [
  ".....n.GG...",
  "..GG.nGggG..",
  ".GggGnGGG...",
  "..GG.n......",
  "....oooo....",
  "...owrrro...",
  "...orrrdo...",
  ".ooorddoooo.",
  "owrroooowrro",
  "orrrdoorrrdo",
  "orrddoorrddo",
  ".oooo..oooo.",
  "..ssssssss..",
];

const BERRY_COLORS = {
  G: "#2e7d32",
  g: "#66bb6a",
  n: "#6d4c2f",
  o: "#5a0f1c",
  r: "#e0243c",
  d: "#a3162b",
  w: "#ffffff",
  s: "rgba(0, 0, 0, 0.25)",
};

// gleiches Muster, nur ist der Glanzpunkt hellrot statt weiß (für das Funkeln)
const BERRY_DULL_COLORS = { ...BERRY_COLORS, w: "#ff8a95" };

const BERRY_IMAGE = createPixelImage(BERRY_PIXELS, BERRY_COLORS);
const BERRY_DULL_IMAGE = createPixelImage(BERRY_PIXELS, BERRY_DULL_COLORS);

class CollectibleBerry extends MovableObject {
  scale = 2; // jedes Muster-Pixel wird 2x2 gezeichnet, wie bei der Ente
  width = BERRY_PIXELS[0].length * this.scale;
  height = BERRY_PIXELS.length * this.scale;
  sparkleTime = 400; // nach so vielen ms geht der Glanzpunkt an oder aus
  offset = { top: 6, right: 0, bottom: 2, left: 0 };

  /**
   * Creates berries that lie on the ground and can be collected.
   * @param {number} x - Position in the level.
   * @param {number} y - Top edge of the berries (their shadow then touches the ground).
   */
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.img = BERRY_IMAGE;
    this.sparkle();
  }


  /**
   * Starts the interval that lets the berries sparkle (they never move).
   */
  sparkle() {
    setStoppableInterval(() => this.updateSparkle(), 1000 / 60);
  }


  /**
   * Switches the shiny spots on or off every sparkleTime milliseconds.
   * Each berry sparkles at a different moment because of its x position.
   */
  updateSparkle() {
    let step = Math.floor((Date.now() + this.x) / this.sparkleTime);
    this.img = step % 2 == 0 ? BERRY_IMAGE : BERRY_DULL_IMAGE;
  }
}
