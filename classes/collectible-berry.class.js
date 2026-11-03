/**
 * A berry lying in the level. The fox collects it by touching it.
 * @extends MovableObject
 */
class CollectibleBerry extends MovableObject {
  scale = 2; // jedes SVG-Pixel wird 2x2 gezeichnet, wie bei der Ente
  width = 12 * this.scale; // berry.svg ist 12 x 13 Pixel groß
  height = 13 * this.scale;
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
    this.img = ICONS.berry;
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
    this.img = step % 2 == 0 ? ICONS.berry : ICONS.berryDull;
  }
}
