const path = require('path');
const fs = require('fs');
const ImageDiff = require('./ImageDiff');

const VISUAL_REGRESSION_THRESHOLD = 0.01;

const getAbsolutePathForScreenshot = (type, testFixture, testName) => (
  path.join('screenshots', type, testFixture, `${testName}.png`).normalize()
);

const getDiffImageName = (imagePath) => {
  return path.join(
    path.dirname(imagePath),
    `${path.basename(imagePath, path.extname(imagePath))}-diff.png`,
  );
};

const doVisualRegression = async (testObject, name, updateScreenshot) => {
  // set window size so screenshots are consistent
  await testObject.resizeWindow(800, 800);
  if(typeof testObject === 'undefined') {
    return;
  }
  const escapeRegex = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const testFixtureName = escapeRegex(testObject.fixture.name);
  const testName = escapeRegex(testObject.test.name);
  const screenShotName = (typeof name === 'string' ? `${testName}_${name}` : testName).replace(/ /g,'_');

  // take actual screenshot
  await testObject.takeScreenshot(path.join('actual', testFixtureName, `${screenShotName}.png`));

  const actualScreenshotAbsolutePath = getAbsolutePathForScreenshot(
    'actual',
    testFixtureName,
    screenShotName,
  );
  const baseScreenshotAbsolutePath = getAbsolutePathForScreenshot(
    'base',
    testFixtureName,
    screenShotName,
  );
  const isActualScreenshotTaken = fs.existsSync(actualScreenshotAbsolutePath);
  const isBaseScreenshotTaken = fs.existsSync(baseScreenshotAbsolutePath);

  const shouldUpdateScreenShot = updateScreenshot
    || testObject.test.meta.updateScreenshots 
    || testObject.fixture.meta.updateScreenshots;

  if (!isBaseScreenshotTaken || shouldUpdateScreenShot) {
    // take base screenshot
    await testObject.takeScreenshot(path.join('base', testFixtureName, `${screenShotName}.png`));
    if (shouldUpdateScreenShot) {
      console.log('Screenshot updated for ' + testFixtureName + ' / ' + screenShotName);
    }
  }

  // Do the comparison if a base and actual screenshot exist
  if (isActualScreenshotTaken && isBaseScreenshotTaken) {
    const imageDiff = new ImageDiff({
      imageOutputPath: getDiffImageName(actualScreenshotAbsolutePath),
      imageAPath: actualScreenshotAbsolutePath,
      imageBPath: baseScreenshotAbsolutePath,
      threshold: VISUAL_REGRESSION_THRESHOLD,
    });

    imageDiff.run(() => {
      if (!imageDiff.hasPassed()) {
        // fail test
        throw new Error(
          `Visual mismatch detected in test: ${testFixtureName}/${screenShotName}. Please investigate.`
        );
      }
    });
  }
};

module.exports = doVisualRegression;