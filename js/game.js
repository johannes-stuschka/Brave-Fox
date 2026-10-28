let world;

let keyBoard = {
  left: false,
  right: false,
};

function init() {
  let canvas = document.getElementById("canvas");
  world = new World(canvas);
}

window.addEventListener("keydown", (event) => {
  if (event.key == "ArrowLeft") {
    keyBoard.left = true;
  }
  if (event.key == "ArrowRight") {
    keyBoard.right = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key == "ArrowLeft") {
    keyBoard.left = false;
  }
  if (event.key == "ArrowRight") {
    keyBoard.right = false;
  }
});
