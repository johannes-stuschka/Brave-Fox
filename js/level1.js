const TILE_WIDTH = 720; // Breite eines Hintergrund-Bildes = Canvas-Breite
const LEVEL1_TILES = 5; // Level ist 5 Bilder lang (5 * 720 = 3600px)
const DUCK_GROUND_Y = 419; // Füße der Ente stehen auf der Bodenlinie (y = 447)

/**
 * Builds a fresh level 1 (can be called again for a restart).
 * @returns {Level} The new level with sky, clouds, backgrounds, enemies and ducks.
 */
function createLevel1() {
  let levelEndX = TILE_WIDTH * LEVEL1_TILES;
  return new Level(
    new Background("./imgs/background/nature_4/1.png", 0),
    createClouds(levelEndX),
    createBackgroundTiles(LEVEL1_TILES),
    createEnemies(),
    createDucks(),
    levelEndX,
  );
}


/**
 * Places both background layers side by side, each tile exactly
 * TILE_WIDTH pixels after the one before, so there are no gaps.
 * Every second tile is mirrored, so neighbouring tiles share the same
 * edge pixels and no hard cut is visible at the tile borders.
 * @param {number} count - How many tiles per layer.
 * @returns {Background[]} All background tiles (back layer first).
 */
function createBackgroundTiles(count) {
  let tiles = [];
  let layers = ["./imgs/background/nature_4/3.png", "./imgs/background/nature_4/4.png"];
  layers.forEach((path) => {
    for (let i = 0; i < count; i++) {
      let mirrored = i % 2 === 1;
      tiles.push(new Background(path, i * TILE_WIDTH, mirrored));
    }
  });
  return tiles;
}


/**
 * Creates one cloud per tile, so clouds cover the whole level.
 * @param {number} levelEndX - Right end of the level.
 * @returns {Cloud[]} The clouds.
 */
function createClouds(levelEndX) {
  let clouds = [];
  for (let x = 0; x < levelEndX; x += TILE_WIDTH) {
    clouds.push(new Cloud(x, levelEndX));
  }
  return clouds;
}


/**
 * Spreads the walking hunters over the level, far enough from the start of the fox.
 * The shooting hunters stand in the gaps between the walking hunters.
 * @returns {Hunter[]} The enemies.
 */
function createEnemies() {
  return [
    new WalkingHunter(1000),
    new ShootingHunter(1400),
    new WalkingHunter(1800),
    new ShootingHunter(2300),
    new WalkingHunter(2700),
    new ShootingHunter(3100),
    new WalkingHunter(3400),
  ];
}


/**
 * Places the collectible ducks on the ground, spread over the whole level.
 * They stand between the start points of the hunters, not on top of them.
 * @returns {CollectibleDuck[]} The ducks.
 */
function createDucks() {
  let duckXs = [300, 450, 600, 800, 1200, 1620, 2050, 2200, 2550, 2950, 3300];
  return duckXs.map((x) => new CollectibleDuck(x, DUCK_GROUND_Y));
}
