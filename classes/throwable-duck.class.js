class ThrowableDuck extends MovableObject {
  scale = 2; // gleich groß wie die Ente zum Einsammeln
  width = DUCK_PIXELS[0].length * this.scale;
  height = DUCK_PIXELS.length * this.scale;
  groundY = 419; // hier berühren die Füße der Ente den Boden (wie DUCK_GROUND_Y)
  speedX = 7.5; // Pixel pro Tick nach vorne
  speedY = 7; // Start-Geschwindigkeit nach oben, so fliegt die Ente im Bogen
  acceleration = 0.4; // etwas weniger Schwerkraft als beim Fuchs: schöner, weiter Bogen
  spinSpeed = 0.2; // so stark (in Bogenmaß) dreht sich die Ente pro Tick
  rotation = 0; // aktuelle Drehung, World.addToMap zeichnet die Ente damit gedreht
  direction; // -1 = fliegt nach links, 1 = fliegt nach rechts
  offset = { top: 2, right: 2, bottom: 2, left: 2 };

  /**
   * Creates a thrown duck. It starts centered on centerX and flies in the given direction.
   * When it flies to the left, the duck image is mirrored.
   * @param {number} centerX - Horizontal middle of the duck at the start.
   * @param {number} y - Top edge of the duck at the start.
   * @param {number} direction - -1 flies to the left, 1 flies to the right.
   */
  constructor(centerX, y, direction) {
    super();
    this.x = centerX - this.width / 2;
    this.y = y;
    this.direction = direction;
    this.otherDirection = direction < 0;
    this.img = DUCK_IMAGE;
  }


  /**
   * One flight step: forward, up or down along the arc, and a little spin.
   * Called 60 times per second by the World.
   */
  move() {
    this.x += this.speedX * this.direction;
    this.y -= this.speedY;
    this.speedY -= this.acceleration;
    this.rotation += this.spinSpeed;
  }


  /**
   * Checks if the duck has fallen down to the ground.
   * @returns {boolean} True when the feet of the duck reached the ground.
   */
  hasLanded() {
    return this.y >= this.groundY;
  }
}
