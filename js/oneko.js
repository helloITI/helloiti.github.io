
(function () {
  const nekoEl = document.createElement("div");

  let nekoPosX = window.innerWidth / 2;
  let nekoPosY = 30;
  let mousePosX = nekoPosX;
  let mousePosY = nekoPosY;

  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;

  const nekoSpeed = 11;

const spriteSets = {
  idle: [[0, 0]],

  alert: [[1, 0]],

  scratch: [
    [2, 0],
    [3, 0],
    [4, 0],
  ],

  tired: [[5, 0]],

  sleeping: [
    [6, 0],
    [7, 0],
  ],

  // movement (row 1 & 2)
  N: [
    [0, 1],
    [1, 1],
  ],
  NE: [
    [2, 1],
    [3, 1],
  ],
  E: [
    [4, 1],
    [5, 1],
  ],
  SE: [
    [6, 1],
    [7, 1],
  ],
  S: [
    [0, 2],
    [1, 2],
  ],
  SW: [
    [2, 2],
    [3, 2],
  ],
  W: [
    [4, 2],
    [5, 2],
  ],
  NW: [
    [6, 2],
    [7, 2],
  ],
};


function create() {
  nekoEl.id = "oneko";
  nekoEl.style.position = "fixed";
  nekoEl.style.width = "32px";
  nekoEl.style.height = "32px";
  nekoEl.style.left = "100px";
  nekoEl.style.top = "100px";
  nekoEl.style.pointerEvents = "none";
  nekoEl.style.zIndex = "99999";
  nekoEl.style.imageRendering = "pixelated";
  nekoEl.style.backgroundImage =
    "url('https://hellot.nekoweb.org/assets/transparent.png')";
  nekoEl.style.backgroundSize = "256px 128px";

  document.body.appendChild(nekoEl);

  document.addEventListener("mousemove", (e) => {
    mousePosX = e.clientX;
    mousePosY = e.clientY;
  });

  setInterval(frame, 100);
}


function setSprite(name, frame) {
  const sprite = spriteSets[name];
  if (!sprite) return;

  const [x, y] = sprite[frame % sprite.length];
  nekoEl.style.backgroundPosition = `-${x * 32}px -${y * 32}px`;
}

  function resetIdle() {
    idleAnimation = null;
    idleAnimationFrame = 0;
  }

  function idle() {
    idleTime++;

    if (
      idleTime > 10 &&
      Math.random() < 0.005 &&
      idleAnimation === null
    ) {
      idleAnimation = Math.random() < 0.5 ? "sleeping" : "scratch";
    }

    switch (idleAnimation) {
      case "sleeping":
        if (idleAnimationFrame < 8) {
          setSprite("tired", 0);
        } else {
          setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
        }
        if (idleAnimationFrame > 200) resetIdle();
        break;

      case "scratch":
        setSprite("scratch", idleAnimationFrame);
        if (idleAnimationFrame > 10) resetIdle();
        break;

      default:
        setSprite("idle", 0);
        return;
    }

    idleAnimationFrame++;
  }

  function frame() {
    frameCount++;

    const diffX = nekoPosX - mousePosX;
    const diffY = nekoPosY - mousePosY;
    const distance = Math.hypot(diffX, diffY);

    if (distance < 24) {
      idle();
      return;
    }

    idleTime = 0;
    resetIdle();

    let direction = "";
    if (diffY / distance > 0.5) direction += "N";
    if (diffY / distance < -0.5) direction += "S";
    if (diffX / distance > 0.5) direction += "W";
    if (diffX / distance < -0.5) direction += "E";

    setSprite(direction, frameCount);

    nekoPosX -= (diffX / distance) * nekoSpeed;
    nekoPosY -= (diffY / distance) * nekoSpeed;

    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
  }

  create();
})();
