class Background extends MovableObject {
  x = 0;
  y = 0;
  width = 720;
  height = 480;

  constructor(imagePath) {
    super().loadImage(imagePath);
  }
}
