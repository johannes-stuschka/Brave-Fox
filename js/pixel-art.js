/**
 * Paints a pixel pattern onto a small offscreen canvas, one square per character.
 * The World and the StatusBar can draw this canvas exactly like a normal image.
 * Characters that are missing in the color map (e.g. ".") stay transparent.
 * @param {string[]} pixels - The pattern, one string per row.
 * @param {Object<string, string>} colors - Which color belongs to which character.
 * @param {number} [pixelSize=1] - Size of one pattern pixel on the canvas.
 * @returns {HTMLCanvasElement} The painted image.
 */
function createPixelImage(pixels, colors, pixelSize = 1) {
  let canvas = document.createElement("canvas");
  canvas.width = pixels[0].length * pixelSize;
  canvas.height = pixels.length * pixelSize;
  let ctx = canvas.getContext("2d");
  pixels.forEach((row, rowIndex) => {
    for (let col = 0; col < row.length; col++) {
      paintPixel(ctx, colors[row[col]], col * pixelSize, rowIndex * pixelSize, pixelSize);
    }
  });
  return canvas;
}


/**
 * Paints one square of a pixel image. No color means a transparent pixel.
 * @param {CanvasRenderingContext2D} ctx - Context of the offscreen canvas.
 * @param {string|undefined} color - Fill color, or undefined for nothing.
 * @param {number} x - Left edge of the square.
 * @param {number} y - Top edge of the square.
 * @param {number} size - Width and height of the square.
 */
function paintPixel(ctx, color, x, y, size) {
  if (!color) {
    return;
  }
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
}
