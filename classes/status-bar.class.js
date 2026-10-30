// Pixel-Herz für die Lebensanzeige: "#" = Rot, "o" = dunkler Rand, "w" = Glanzpunkt, "." = durchsichtig
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

const HEART_IMAGE = createPixelImage(HEART_PIXELS, { "#": "#c0392b", o: "#2b1d10", w: "#ffffff" });

class StatusBar {
  x;
  y;
  color; // Füllfarbe des Balkens
  icon; // Bild des Icons (z.B. HEART_IMAGE oder DUCK_IMAGE)
  pixelSize; // so groß wird ein Icon-Pixel gezeichnet
  maxValue; // dieser Wert entspricht einem vollen Balken
  percentage = 100;
  iconBoxWidth = 34; // fester Platz für das Icon, damit alle Balken bündig untereinander stehen
  iconBoxHeight = 28;
  barWidth = 150;
  barHeight = 14;
  frameColor = "#5b3a1e"; // Holz-Rahmen
  emptyColor = "#2b1d10"; // dunkles Holz, wenn der Balken leer ist

  /**
   * Creates a status bar that stays fixed on the screen.
   * The same class can show health, ducks, berries or the boss energy.
   * @param {number} x - Left edge on the canvas.
   * @param {number} y - Top edge on the canvas.
   * @param {string} color - Fill color of the bar.
   * @param {HTMLCanvasElement} icon - Icon image (made with createPixelImage).
   * @param {number} maxValue - The value that fills the whole bar.
   * @param {number} [pixelSize=3] - How big one icon pixel is drawn.
   */
  constructor(x, y, color, icon, maxValue, pixelSize = 3) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.icon = icon;
    this.maxValue = maxValue;
    this.pixelSize = pixelSize;
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
   * Draws the icon scaled up and centered in its icon box.
   * @param {CanvasRenderingContext2D} ctx - The canvas context.
   */
  drawIcon(ctx) {
    let width = this.getIconWidth();
    let height = this.getIconHeight();
    let iconX = this.x + Math.round((this.iconBoxWidth - width) / 2);
    let iconY = this.y + Math.round((this.iconBoxHeight - height) / 2);
    ctx.drawImage(this.icon, iconX, iconY, width, height);
  }


  /**
   * Draws the wooden frame, the empty part and the filled part of the bar.
   * @param {CanvasRenderingContext2D} ctx - The canvas context.
   */
  drawBar(ctx) {
    let barX = this.x + this.iconBoxWidth + 6;
    let barY = this.y + (this.iconBoxHeight - this.barHeight) / 2;
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
    return this.icon.width * this.pixelSize;
  }


  /**
   * Returns the drawn height of the icon.
   * @returns {number} Height in pixels.
   */
  getIconHeight() {
    return this.icon.height * this.pixelSize;
  }
}
