let uri = "e4a370d69900017e241f33f98171d9f4.jpg";
let source;
let sourcePixels = [];
let workingPixels = [];
let threshold;
let cRow;
let cCol;

function update() {
  threshold = int(map(mouseX, 0, width - 1, Math.floor(16777216), -16777216));
  // console.log(threshold);
}

function preload() {
  source = loadImage(uri);
}

function setup() {
  createCanvas(source.width, source.height);
  pixelDensity(1);
  cursor("HAND");

  source.loadPixels();
  source.updatePixels();

  for (let i = 0; i < 4 * (source.width * source.height); i += 1) {
    sourcePixels[i / 4] =
      (255 << 24) |
      (source.pixels[i] << 16) |
      (source.pixels[i + 1] << 8) |
      source.pixels[i + 2];
  }

  loadPixels();
}

function draw() {
  clear();

  workingPixels = sourcePixels.slice();
  cRow = 0;
  cCol = 0;

  while (cRow < height - 1) {
    sortRow();
    cRow++;
  }

  while (cCol < width - 1) {
    sortCol();
    cCol++;
  }

  const imageBytes = 4 * (source.width * source.height);

  let i = 0;
  while (i < imageBytes) {
    const col = workingPixels[i / 4] || 0;
    pixels[i++] = (col >> 16) & 255;
    pixels[i++] = (col >> 8) & 255;
    pixels[i++] = col & 255;
    pixels[i++] = 255;
  }

  updatePixels();

  update();
}

function sortRow() {
  const y = cRow;
  const rowIndex = y * source.width;

  let currX = 0;
  let endX = 0;

  while (endX < width - 1) {
    currX = getFirstNotWhiteX(currX, y);
    endX = getNextWhiteX(currX, y);

    if (currX < 0) break;
    const sortLength = endX - currX;
    const unsorted = [];
    let sorted = [];

    for (let i = 0; i < sortLength; i++) {
      unsorted[i] = workingPixels[currX + rowIndex + i];
    }

    sorted = sort(unsorted);

    for (let i = 0; i < sortLength; i++) {
      workingPixels[currX + rowIndex + i] = sorted[i];
    }

    currX = endX + 1;
  }
}

function sortCol() {
  const x = cCol;

  let yStart = 0;
  let yEnd = 0;

  while (yEnd < height - 1) {
    yStart = getFirstNotWhiteY(x, yStart);
    yEnd = getNextWhiteY(x, yStart);

    if (yStart < 0) break;
    const sortLength = yEnd - yStart;
    const unsorted = [];
    let sorted = [];

    for (let i = 0; i < sortLength; i++) {
      unsorted[i] = workingPixels[x + (yStart + i) * source.width];
    }

    sorted = sort(unsorted);

    for (let i = 0; i < sortLength; i++) {
      workingPixels[x + (yStart + i) * source.width] = sorted[i];
    }

    yStart = yEnd + 1;
  }
}

function getFirstNotWhiteX(x, y) {
  const iRow = y * source.width;
  while (workingPixels[x + iRow] > threshold) {
    x++;
    if (x >= width) return -1;
  }
  return x;
}

function getNextWhiteX(x, y) {
  x++;
  const iRow = y * source.width;
  while (workingPixels[x + iRow] < threshold) {
    x++;
    if (x >= width) return width - 1;
  }
  return x - 1;
}

function getFirstNotWhiteY(x, y) {
  if (y < height) {
    while (workingPixels[x + y * source.width] > threshold) {
      y++;
      if (y >= height) return -1;
    }
  }
  return y;
}

function getNextWhiteY(x, y) {
  y++;
  if (y < height) {
    while (workingPixels[x + y * source.width] < threshold) {
      y++;
      if (y >= height) return height - 1;
    }
  }
  return y - 1;
}
