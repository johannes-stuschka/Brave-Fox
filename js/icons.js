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
  heart: loadIcon("heart.svg"),
  duck: loadIcon("duck.svg"),
  berry: loadIcon("berry.svg"),
  berryDull: loadIcon("berry-dull.svg"),
  bossHat: loadIcon("boss-hat.svg"),
  zzz: loadIcon("zzz.svg"),
  bullet: loadIcon("bullet.svg"),
};

/**
 * Updates an icon button (mute or fullscreen): new icon, screen reader label and tooltip.
 * @param {string} buttonId - The id of the button.
 * @param {string} iconId - The id of the img inside the button.
 * @param {string} iconSrc - Path of the new icon.
 * @param {string} label - Text for screen readers.
 * @param {string} [title=label] - Text for the tooltip (e.g. with a key hint).
 */
function updateIconButton(buttonId, iconId, iconSrc, label, title = label) {
  let button = document.getElementById(buttonId);
  document.getElementById(iconId).src = iconSrc;
  button.setAttribute("aria-label", label);
  button.title = title;
}
