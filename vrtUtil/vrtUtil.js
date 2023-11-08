const path = require('path');
const fs = require('fs');
const ImageDiff = require('./ImageDiff');

// Matching threshold as a decimal percentage of the maximum acceptable square distance between two colors;
// Ranges from 0 to 1. Smaller values make the comparison more sensitive.
const DEFAULT_VRT_THRESHOLD = 0.1;
const BACON_CI_BASE_PATH = path.join('build2', 'reports', 'vrt', 'artifacts', 'screenshots');

const getActualScreenshotPath = (testFixture, testName) => (
  path.join(BACON_CI_BASE_PATH, 'actual', testFixture, `${testName}.png`).normalize()
);

const getBaseScreenshotPath = (testFixture, testName) => (
  path.join('screenshots', 'base', testFixture, `${testName}.png`).normalize()
);

const getDiffImagePath = (imagePath) => {
  return path.join(
    path.dirname(imagePath),
    `${path.basename(imagePath, path.extname(imagePath))}-diff.png`,
  );
};

// eslint-disable-next-line complexity, max-statements
const compareScreenshot = async (testObject, options) => {
  if (typeof testObject === 'undefined') {
    return;
  }
  // set window size so screenshots are consistent
  await testObject.resizeWindow(1600, 1600);

  const { fullPage, threshold, strictMode, name } = options;
  const escapeRegex = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const testFixtureName = escapeRegex(testObject.testRun.test.testFile.currentFixture.name);
  const testName = escapeRegex(testObject.testRun.test.name);
  const screenShotName = (typeof name === 'string' ? `${testName}_${name}` : testName).replace(/ /g,'_');

  // take actual screenshot
  await testObject.takeScreenshot({
    path: path.join(
      'actual',
      testFixtureName,
      `${screenShotName}.png`
    ),
    fullPage,
  });

  const actualScreenshotAbsolutePath = getActualScreenshotPath(testFixtureName, screenShotName);
  const baseScreenshotAbsolutePath = getBaseScreenshotPath(testFixtureName, screenShotName);
  const isActualScreenshotTaken = fs.existsSync(actualScreenshotAbsolutePath);
  const isBaseScreenshotTaken = fs.existsSync(baseScreenshotAbsolutePath);

  // updateScreenshots flag can be from test/fixture metadata 
  // or passed into userVariables from the UPDATE_SCREENSHOTS env var
  const shouldUpdateScreenShot = testObject.testRun.test.meta.updateScreenshots 
    || testObject.testRun.test.testFile.currentFixture.meta.updateScreenshots
    || testObject.testRun.opts.userVariables.updateScreenshots;

  // create a new screenshot if a base screenshot does not exist or shouldUpdateScreenShot flag is true
  if (!isBaseScreenshotTaken || shouldUpdateScreenShot) {
    // take base screenshot
    await testObject.takeScreenshot({
      path: path.join('base', testFixtureName, `${screenShotName}.png`),
      fullPage,
    });
    if (shouldUpdateScreenShot) {
      console.log('Screenshot updated for ' + testFixtureName + ' / ' + screenShotName);
    } else {
      console.log('Base screenshot created for ' + testFixtureName + ' / ' + screenShotName);
    }
  }

  // Do the comparison if a base and actual screenshot exist
  if (isActualScreenshotTaken && isBaseScreenshotTaken && !shouldUpdateScreenShot) {
    const imageDiff = new ImageDiff({
      imageOutputPath: getDiffImagePath(actualScreenshotAbsolutePath),
      imageAPath: actualScreenshotAbsolutePath,
      imageBPath: baseScreenshotAbsolutePath,
      threshold: typeof threshold === 'number' ? threshold : DEFAULT_VRT_THRESHOLD,
      strictMode,
    });
    
    // executes the image comparison
    await imageDiff.run();

    if (!imageDiff.hasPassed()) {
      // fail test
      throw new Error(
        `Visual mismatch detected in test: ${testFixtureName}/${screenShotName}.  Please investigate.`
      );
    }
  }
};

module.exports = compareScreenshot;