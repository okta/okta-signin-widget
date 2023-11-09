import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

// Used for the pixelmatch comparison algorithm.
// Decimal percentage of the maximum acceptable square distance between two colors;
// Ranges from 0 to 1. Smaller values make the comparison more sensitive.
const MAX_COLOR_DISTANCE_THRESHOLD = 0.1;

const readPngImage = (image) => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(image).pipe(new PNG())
      .on('parsed', function onParse() {
        resolve(this);
      })
      .on('error', reject);
  });
};

const resizeImage = (image, width, height) => {
  if (image.width !== width || image.height !== height) {
    const resizedImage = new PNG({
      width,
      height,
      bitDepth: image.bitDepth,
      inputHasAlpha: true,
    });

    PNG.bitblt(image, resizedImage, 0, 0, image.width, image.height, 0, 0);
    return resizedImage;
  }
  return image;
};

class ImageDiff {
  constructor(opts) {
    this.options = { ...opts };
    this.width = 0;
    this.height = 0;
    this.differences = 0;
  }

  async run() {
    // get the images to be compared
    const aImage = await readPngImage(this.options.imageAPath);
    const bImage = await readPngImage(this.options.imageBPath);

    // prepare a new difference image the same size as the larger of the two
    const dstImage = new PNG({
      width: Math.max(aImage.width, bImage.width),
      height: Math.max(aImage.height, bImage.height),
    });

    // resize the images to the same dimensions to compare accurately
    const aCanvas = await resizeImage(aImage, dstImage.width, dstImage.height);
    const bCanvas = await resizeImage(bImage, dstImage.width, dstImage.height);

    const options = { threshold: MAX_COLOR_DISTANCE_THRESHOLD };
    // execute the comparison
    const result = pixelmatch(aCanvas.data, bCanvas.data, dstImage.data, dstImage.width, dstImage.height, options);

    // output the difference image
    dstImage.pack().pipe(fs.createWriteStream(this.getDiffImageOutputPath()));

    return Object.assign(this, {
      width: dstImage.width,
      height: dstImage.height,
      differences: result,
    });
  }

  getDiffImageOutputPath() {
    return this.options.imageOutputPath;
  }

  // this method calculates the amount of difference as a percentage (not a decimal)
  getDifferencePercent() {
    // eslint-disable-next-line no-mixed-operators
    return Math.round(100 * 100 * this.differences / (this.width * this.height)) / 100;
  }

  hasPassed() {
    // strict mode does not allow a single difference in pixels.  Exact 1:1 match
    if (this.options.strictMode) {
      return this.differences === 0;
    }
    const percentage = this.getDifferencePercent();
    const maxDiffPercent = this.options.maxDiff || 0.05;
    return percentage <= maxDiffPercent;
  }
}

module.exports = ImageDiff;