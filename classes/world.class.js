class World {
  character = new Character();
  enemies = [new Hunter(), new Hunter(), new Hunter(), new Hunter()];
  sky = new Background("./imgs/background/nature_4/1.png");
  clouds = [new Cloud()];
  backgrounds = [
    new Background("./imgs/background/nature_4/3.png"),
    new Background("./imgs/background/nature_4/4.png"),
  ];
  canvas;
  ctx;

  constructor(canvas) {
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.canvas = canvas;
    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.addToMap(this.sky);
    this.addObjectsToMap(this.clouds);
    this.addObjectsToMap(this.backgrounds);
    this.addObjectsToMap(this.enemies);
    this.addToMap(this.character);

    let self = this;
    requestAnimationFrame(function () {
      self.draw();
    });
  }

  addObjectsToMap(objects) {
    objects.forEach((item) => {
      this.addToMap(item);
    });
  }

  addToMap(item) {
    this.ctx.save();
    if (item.otherDirection) {
      this.ctx.translate(item.x + item.width, item.y); // Nullpunkt an rechte Kante
      this.ctx.scale(-1, 1); // spiegeln
    } else {
      this.ctx.translate(item.x, item.y); // Nullpunkt an linke Kante
    }
    if (item.frameWidth) {
      // Spritesheet: nur das erste Bild ausschneiden
      this.ctx.drawImage(
        item.img,
        item.sourceX,
        item.sourceY,
        item.frameWidth,
        item.frameHeight,
        0,
        0,
        item.width,
        item.height,
      );
    } else {
      // normales Bild: ganz zeichnen
      this.ctx.drawImage(item.img, 0, 0, item.width, item.height);
    }

    this.ctx.restore();
  }
}
