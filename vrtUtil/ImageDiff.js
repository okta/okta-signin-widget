const fs = require('fs');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

function readPngImage(image) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(image).pipe(new PNG())
      .on('parsed', function onParse() {
        resolve(this);
      })
      .on('error', reject);
  });
}

function fixPngImage(image, width, height) {
  if (image.width !== width || image.height !== height) {
    const fixedImage = new PNG({
      width,
      height,
      bitDepth: image.bitDepth,
      inputHasAlpha: true,
    });

    PNG.bitblt(image, fixedImage, 0, 0, image.width, image.height, 0, 0);
    return fixedImage;
  }
  return image;
}

class ImageDiff {
  constructor(opts) {
    this.options = { ...opts };
    this.width = 0;
    this.height = 0;
    this.differences = 0;
  }

  async run(callback) {
    const aImage = await readPngImage(this.options.imageAPath);
    const bImage = await readPngImage(this.options.imageBPath);

    const dstImage = new PNG({
      width: Math.max(aImage.width, bImage.width),
      height: Math.max(aImage.height, bImage.height),
    });

    const aCanvas = await fixPngImage(aImage, dstImage.width, dstImage.height);
    const bCanvas = await fixPngImage(bImage, dstImage.width, dstImage.height);

    const options = { threshold: 0.1 };
    const result = pixelmatch(aCanvas.data, bCanvas.data, dstImage.data, dstImage.width, dstImage.height, options);

    dstImage.pack().pipe(fs.createWriteStream(this.getImageOutput()));

    callback(Object.assign(this, {
      width: dstImage.width,
      height: dstImage.height,
      differences: result,
    }));
  }

  getImageOutput() {
    return this.options.imageOutputPath;
  }

  getDifference() {
    // eslint-disable-next-line no-mixed-operators
    return Math.round(100 * 100 * this.differences / (this.width * this.height)) / 100;
  }

  hasPassed() {
    const percentage = this.getDifference();
    return percentage <= this.options.threshold;
  }
}

module.exports = ImageDiff;