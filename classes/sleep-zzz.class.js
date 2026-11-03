/**
 * The "z Z" bubbles above the sleeping fox.
 */
class SleepZzz {
  cycle = 2700; // so lange (ms) braucht ein Z vom Kopf bis zum Verschwinden
  letterCount = 3; // so viele Z schweben gleichzeitig
  riseHeight = 30; // so viele Pixel steigt ein Z nach oben
  driftWidth = 14; // so viele Pixel wandert ein Z zur Seite (in Blickrichtung)
  headX = 50; // Kopf des liegenden Fuchses (Blick nach rechts), von der linken Kante aus
  headY = 26; // Kopf des liegenden Fuchses, von der Oberkante aus
  smallSize = 6; // kleines "z" direkt über dem Kopf (zzz.svg in Originalgröße 6 x 6)
  bigSize = 12; // großes "Z" weiter oben (doppelt so groß)

  /**
   * Draws all Z letters. Each one starts a bit later than the one before,
   * so they rise one after another.
   * @param {CanvasRenderingContext2D} ctx - The canvas to draw on.
   * @param {Character} fox - The sleeping fox.
   */
  draw(ctx, fox) {
    let sleepTime = fox.getSleepTime();
    for (let i = 0; i < this.letterCount; i++) {
      let letterTime = sleepTime - (i * this.cycle) / this.letterCount;
      if (letterTime >= 0) {
        this.drawLetter(ctx, fox, (letterTime % this.cycle) / this.cycle);
      }
    }
  }


  /**
   * Draws one Z: it rises, wobbles a little and fades in and out softly.
   * @param {CanvasRenderingContext2D} ctx - The canvas to draw on.
   * @param {Character} fox - The sleeping fox.
   * @param {number} progress - How far the Z has flown, from 0 (at the head) to 1 (gone).
   */
  drawLetter(ctx, fox, progress) {
    if (!isImageReady(ICONS.zzz)) {
      return;
    }
    let size = progress < 0.4 ? this.smallSize : this.bigSize;
    let x = this.getLetterX(fox, progress) - size / 2;
    let y = fox.y + this.headY - progress * this.riseHeight - size;
    ctx.save();
    ctx.globalAlpha = this.getAlpha(progress);
    ctx.drawImage(ICONS.zzz, Math.round(x), Math.round(y), size, size);
    ctx.restore();
  }


  /**
   * Returns the middle x of a Z: above the head, drifting away in the direction the fox looks.
   * @param {Character} fox - The sleeping fox.
   * @param {number} progress - How far the Z has flown (0 to 1).
   * @returns {number} The x position in level coordinates.
   */
  getLetterX(fox, progress) {
    let direction = fox.otherDirection ? -1 : 1;
    let startX = fox.otherDirection ? fox.x + fox.width - this.headX : fox.x + this.headX;
    let wobble = Math.sin(progress * Math.PI * 2) * 2;
    return startX + direction * progress * this.driftWidth + wobble;
  }


  /**
   * Returns how visible a Z is: it fades in quickly at the start and fades out slowly.
   * @param {number} progress - How far the Z has flown (0 to 1).
   * @returns {number} Opacity from 0 (invisible) to 1 (fully visible).
   */
  getAlpha(progress) {
    if (progress < 0.2) {
      return progress / 0.2;
    }
    return 1 - (progress - 0.2) / 0.8;
  }
}
