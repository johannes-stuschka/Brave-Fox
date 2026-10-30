// Pixel-Ente (schaut nach rechts): "w" = weiß, "s" = Flügel-Schatten, "o" = Rand, "e" = Auge,
// "p" = rosa Bäckchen, "y" = Schnabel, "f" = Füße, "." = durchsichtig
const DUCK_PIXELS = [
  "..........oooo...",
  ".........owwwwo..",
  ".........owwewo..",
  ".........owwwwyyo",
  ".........owwpwyyo",
  "..o......owwwooo.",
  ".owo....owwwwo...",
  ".owwooooowwwwwo..",
  ".owwwwwwwwwwwwo..",
  ".owwwwssswwwwwo..",
  ".owwwwwsssswwwo..",
  "..owwwwwwwwwwo...",
  "...oooooooooo....",
  ".....ff....ff....",
];

const DUCK_COLORS = {
  w: "#ffffff",
  s: "#d6dde6",
  o: "#3a3a3a",
  e: "#111111",
  p: "#f7a8b8",
  y: "#f5a623",
  f: "#e67e22",
};

const DUCK_IMAGE = createPixelImage(DUCK_PIXELS, DUCK_COLORS);

class CollectibleDuck extends MovableObject {
  scale = 2; // jedes Muster-Pixel wird 2x2 gezeichnet, wie beim Fuchs
  width = DUCK_PIXELS[0].length * this.scale;
  height = DUCK_PIXELS.length * this.scale;
  baseY; // Ruhe-Höhe, um die die Ente auf und ab wippt
  bobHeight = 2; // so viele Pixel wippt die Ente nach oben und unten
  bobSpeed = 0.004; // wie schnell sie wippt
  offset = { top: 0, right: 2, bottom: 2, left: 2 };

  /**
   * Creates a duck that lies in the level and can be collected as ammo.
   * @param {number} x - Position in the level.
   * @param {number} y - Top edge of the duck (ground or jump height).
   */
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.img = DUCK_IMAGE;
    this.bob();
  }


  /**
   * Starts the interval that lets the duck gently bob up and down.
   */
  bob() {
    setStoppableInterval(() => this.updateBob(), 1000 / 60);
  }


  /**
   * Moves the duck along a sine wave around baseY (whole pixels stay crisp).
   * Each duck starts at a different point of the wave because of its x position.
   */
  updateBob() {
    let wave = Math.sin(Date.now() * this.bobSpeed + this.x);
    this.y = this.baseY + Math.round(wave * this.bobHeight);
  }
}
