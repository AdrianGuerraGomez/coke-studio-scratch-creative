/* FUNCION INIT DEL ENABLER */
(function () {
  Enabler.addEventListener(studio.events.StudioEvent.INIT, init);
  if (Enabler.isInitialized()) {
    init();
  }
})();

var isInit = false;

function init() {
  if (isInit) return;
  isInit = true;
  if (Enabler.isPageLoaded()) {
    enablerInitHandler();
  } else {
    Enabler.addEventListener(
      studio.events.StudioEvent.PAGE_LOADED,
      enablerInitHandler
    );
  }
}

function enablerInitHandler() {
  /* TIMEOUTS QUE AÑADEN LAS CLASES STEPS*/
  setTimeout(() => {
    document.body.classList.add('step-1');
  }, 100);

  setTimeout(() => {
    document.body.classList.add('step-2');
  }, 200);

  setTimeout(() => {
    document.body.classList.add('step-3');
  }, 500);

  /* DECLARACION DE CONSTANTES Y VARIABLES */

  const ctaExitElement = document.querySelector('.cta');
  const logoExitElement = document.querySelector('.logo');

  /* EVENTOS DE MÉTRICA */

  let exitClickCounter = 0;
  ctaExitElement.addEventListener('click', () => {
    exitClickCounter++;
    Enabler.counter('Clicks', exitClickCounter);
    Enabler.exit('Click on CTA', '');
  });

  let logoClickCounter = 0;
  logoExitElement.addEventListener('click', () => {
    logoClickCounter++;
    Enabler.counter('Clicks', logoClickCounter);
    Enabler.exit('Click on LOGO', '');
  });
}

/* LOGICA SCRATCH CANVAS */

const bridgeCanvas = document.getElementById('scratch-canvas').getContext('2d');
const brushRadius = Math.max((bridgeCanvas.canvas.width / 100) * 5, 50);
const totalPixels = bridgeCanvas.canvas.width * bridgeCanvas.canvas.height;
let scratchedPixels = 0;
const scratchThreshold = 0.2; // 50%

const image = document.getElementById('sourceImage');

image.onload = () =>
  bridgeCanvas.drawImage(
    image,
    0,
    0,
    bridgeCanvas.canvas.width,
    bridgeCanvas.canvas.height
  );

if (image.complete) {
  image.onload();
}

function isLeftButtonPressed(event) {
  return event.buttons === 1 || event.which === 1 || event.button === 1;
}

function getBrushPosition(event) {
  const { left, top, right, bottom } =
    bridgeCanvas.canvas.getBoundingClientRect();
  return {
    x: Math.floor(
      ((event.clientX - left) / (right - left)) * bridgeCanvas.canvas.width
    ),
    y: Math.floor(
      ((event.clientY - top) / (bottom - top)) * bridgeCanvas.canvas.height
    )
  };
}

function drawDot(x, y) {
  bridgeCanvas.beginPath();
  bridgeCanvas.arc(x, y, brushRadius, 0, 2 * Math.PI);
  bridgeCanvas.fillStyle = '#000';
  bridgeCanvas.globalCompositeOperation = 'destination-out';
  bridgeCanvas.fill();

  // Update scratched pixels count
  updateScratchedPixels();
}

function updateScratchedPixels() {
  const imageData = bridgeCanvas.getImageData(
    0,
    0,
    bridgeCanvas.canvas.width,
    bridgeCanvas.canvas.height
  );
  const data = imageData.data;
  let transparentPixels = 0;

  for (let i = 3; i < data.length; i += 4) {
    if (data[i] === 0) {
      // Check if the alpha channel is transparent
      transparentPixels++;
    }
  }

  const scratchedPercentage = transparentPixels / totalPixels;

  if (scratchedPercentage >= scratchThreshold) {
    document.querySelector('.banner').classList.add('reveal');
  }
}

bridgeCanvas.canvas.addEventListener('mousemove', event => {
  if (isLeftButtonPressed(event)) {
    const { x, y } = getBrushPosition(event);
    drawDot(x, y);
  }
});

bridgeCanvas.canvas.addEventListener('touchmove', event => {
  event.preventDefault();
  const touch = event.targetTouches[0];
  if (touch) {
    const { x, y } = getBrushPosition(touch);
    drawDot(x, y);
  }
});
