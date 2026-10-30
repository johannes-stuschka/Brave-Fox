// Pixel-Herz für die Lebensanzeige: "#" = Farbe, "o" = dunkler Rand, "w" = Glanzpunkt, "." = durchsichtig
const HEART_PIXELS = [
  ".oo...oo.",
  "o##o.o##o",
  "o#w#####o",
  "o#######o",
  ".o#####o.",
  "..o###o..",
  "...o#o...",
  "....o....",
];

class StatusBar {
  x;
  y;
  color; // Füllfarbe des Balkens und des Icons
  iconPixels; // Pixel-Muster des Icons (siehe HEART_PIXELS)
  maxValue; // dieser Wert entspricht einem vollen Balken
  percentage = 100;
  pixelSize = 3; // so groß wird ein Icon-Pixel gezeichnet
  barWidth = 150;
  barHeight = 14;
  frameColor = "#5b3a1e"; // Holz-Rahmen
  emptyColor = "#2b1d10"; // dunkles Holz, wenn der Balken leer ist
  outlineColor = "#2b1d10";

  /**
   * Creates a status bar that stays fixed on the screen.
   * The same class can show health, ducks, berries or the boss energy.
   * @param {number} x - Left edge on the canvas.
   * @param {number} y - Top edge on the canvas.
   * @param {string} color - Fill color of bar and icon.
   * @param {string[]} iconPixels - Pixel pattern of the icon.
   * @param {number} maxValue - The value that fills the whole bar.
   */
  constructor(x, y, color, iconPixels, maxValue) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.iconPixels = iconPixels;
    this.maxValue = maxValue;
  }


  /**
   * Converts a value (e.g. energy 60 of 100) into a percentage for the bar.
   * @param {number} value - The current value.
   */
  setValue(value) {
    this.setPercentage((value / this.maxValue) * 100);
  }


  /**
   * Sets how full the bar is, kept between 0 and 100.
   * @param {number} percentage - Fill level in percent.
   */
  setPercentage(percentage) {
    this.percentage = Math.min(100, Math.max(0, percentage));
  }


  /**
   * Draws icon and bar. Must be called after the camera translate was undone.
   * @param {CanvasRenderingContext2D} ctx - The canvas context.
   */
  draw(ctx) {
    this.drawIcon(ctx);
    this.drawBar(ctx);
  }


  /**
   * Draws the pixel icon row by row, one small square per character.
   * @param {CanvasRenderingContext2D} ctx - The canvas context.
   */
  drawIcon(ctx) {
    this.iconPixels.forEach((row, rowIndex) => {
      for (let col = 0; col < row.length; col++) {
        this.drawIconPixel(ctx, row[col], col, rowIndex);
      }
    });
  }


  /**
   * Draws one icon pixel in the color that belongs to its character.
   * @param {CanvasRenderingContext2D} ctx - The canvas context.
   * @param {string} char - "#", "o", "w" or "." (nothing is drawn).
   * @param {number} col - Column in the pattern.
   * @param {number} row - Row in the pattern.
   */
  drawIconPixel(ctx, char, col, row) {
    let colors = { "#": this.color, o: this.outlineColor, w: "#ffffff" };
    if (!colors[char]) {
      return;
    }
    ctx.fillStyle = colors[char];
    ctx.fillRect(this.x + col * this.pixelSize, this.y + row * this.pixelSize, this.pixelSize, this.pixelSize);
  }


  /**
   * Draws the wooden frame, the empty part and the filled part of the bar.
   * @param {CanvasRenderingContext2D} ctx - The canvas context.
   */
  drawBar(ctx) {
    let barX = this.x + this.getIconWidth() + 6;
    let barY = this.y + (this.getIconHeight() - this.barHeight) / 2;
    ctx.fillStyle = this.frameColor;
    ctx.fillRect(barX - 3, barY - 3, this.barWidth + 6, this.barHeight + 6);
    ctx.fillStyle = this.emptyColor;
    ctx.fillRect(barX, barY, this.barWidth, this.barHeight);
    let fillWidth = Math.round((this.barWidth * this.percentage) / 100);
    ctx.fillStyle = this.color;
    ctx.fillRect(barX, barY, fillWidth, this.barHeight);
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)"; // heller Streifen oben = Glanz
    ctx.fillRect(barX, barY + 2, fillWidth, 2);
  }


  /**
   * Returns the drawn width of the icon.
   * @returns {number} Width in pixels.
   */
  getIconWidth() {
    return this.iconPixels[0].length * this.pixelSize;
  }


  /**
   * Returns the drawn height of the icon.
   * @returns {number} Height in pixels.
   */
  getIconHeight() {
    return this.iconPixels.length * this.pixelSize;
  }
}
