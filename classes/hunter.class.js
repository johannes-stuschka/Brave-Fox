class Hunter extends MovableObject {
  frameWidth = 128; // ein Frame im Cowboy-Spritesheet (z.B. Walk.png: 1536 / 12)
  frameHeight = 128;
  width = 160; // 1.25x gezeichnet: sichtbare Figur ca. 91px, knapp 2x so groß wie der Fuchs
  height = 160;
  y = 287; // Füße (unterste Sprite-Zeile) stehen auf der Bodenlinie des Fuchses (y = 447)
  otherDirection = true; // Sprite schaut nach rechts, Jäger schauen zum Fuchs nach links

  /**
   * Shared base for all hunters: sets the position in the level.
   * Subclasses define their animations and call startAnimations().
   * @param {number} x - Position of the hunter in the level.
   */
  constructor(x) {
    super();
    this.x = x;
  }


  /**
   * Preloads the sprite sheets of this hunter and starts its animation interval.
   */
  startAnimations() {
    this.loadImages(Object.values(this.animations));
    this.animate();
  }
}
