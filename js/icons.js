// Pixel-Art-Grafiken für das Canvas (SVG-Dateien in imgs/icons).
// Sie werden schon beim Laden der Seite vorgeladen, damit sie beim Spielstart fertig sind.
const ICON_FOLDER = "./imgs/icons/";


/**
 * Starts loading one icon file from the icon folder.
 * @param {string} fileName - File name inside imgs/icons, e.g. "heart.svg".
 * @returns {HTMLImageElement} The image, it finishes loading in the background.
 */
function loadIcon(fileName) {
  let img = new Image();
  img.src = ICON_FOLDER + fileName;
  return img;
}


/**
 * Checks if an image can be drawn. A canvas is always ready, an image file only after it has loaded.
 * @param {HTMLImageElement|HTMLCanvasElement} image - The image to check.
 * @returns {boolean} True if the image can be drawn.
 */
function isImageReady(image) {
  if (!(image instanceof HTMLImageElement)) {
    return Boolean(image);
  }
  return image.complete && image.naturalWidth > 0;
}


const ICONS = {
  heart: loadIcon("heart.svg"), // Lebensanzeige
  duck: loadIcon("duck.svg"), // Enten-Anzeige, Ente zum Einsammeln und geworfene Ente
  berry: loadIcon("berry.svg"), // Beeren mit weißem Glanzpunkt
  berryDull: loadIcon("berry-dull.svg"), // gleiche Beeren mit hellrotem Glanzpunkt (für das Funkeln)
  bossHat: loadIcon("boss-hat.svg"), // Boss-Lebensanzeige
  zzz: loadIcon("zzz.svg"), // "Z" über dem schlafenden Fuchs
  bullet: loadIcon("bullet.svg"), // Kugel der Jäger
};
