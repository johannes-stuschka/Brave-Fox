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

/**
 * A duck lying in the level. The fox picks it up to throw it later.
 * @extends MovableObject
 */
class CollectibleDuck extends MovableObject {
  scale = 2; // jedes Muster-Pixel wird 2x2 gezeichnet, wie beim Fuchs
  width = DUCK_PIXELS[0].length * this.scale;
  height = DUCK_PIXELS.length * this.scale;
  waddleTime = 600; // nach so vielen ms dreht sich die Ente in die andere Richtung
  offset = { top: 0, right: 2, bottom: 2, left: 2 };

  /**
   * Creates a duck that stands on the ground and can be collected as ammo.
   * @param {number} x - Position in the level.
   * @param {number} y - Top edge of the duck (its feet then touch the ground).
   */
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.img = DUCK_IMAGE;
    this.waddle();
  }


  /**
   * Starts the interval that lets the duck waddle on the spot (it never leaves the ground).
   */
  waddle() {
    setStoppableInterval(() => this.updateWaddle(), 1000 / 60);
  }


  /**
   * Turns the duck left or right every waddleTime milliseconds.
   * Each duck turns at a different moment because of its x position.
   */
  updateWaddle() {
    let step = Math.floor((Date.now() + this.x) / this.waddleTime);
    this.otherDirection = step % 2 == 1;
  }
}
