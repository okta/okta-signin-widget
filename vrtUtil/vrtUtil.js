const path = require('path');
const fs = require('fs');
const ImageDiff = require('./ImageDiff');

// Matching threshold as a decimal percentage of the maximum acceptable square distance between two colors;
// Ranges from 0 to 1. Smaller values make the comparison more sensitive.
const VISUAL_REGRESSION_THRESHOLD = 0.1;
const BACON_CI_BASE_PATH = path.join('build2', 'reports', 'vrt', 'artifacts', 'screenshots');

const getAbsolutePathForScreenshot = (type, testFixture, testName, useCiPath) => (
  useCiPath
    ? path.join(BACON_CI_BASE_PATH, type, testFixture, `${testName}.png`).normalize()
    : path.join('screenshots', type, testFixture, `${testName}.png`).normalize()
);

const getDiffImagePath = (imagePath) => {
  return path.join(
    path.dirname(imagePath),
    `${path.basename(imagePath, path.extname(imagePath))}-diff.png`,
  );
};

// eslint-disable-next-line complexity, max-statements
const compareScreenshot = async (testObject, name) => {
  if (typeof testObject === 'undefined') {
    return;
  }
  // set window size so screenshots are consistent
  await testObject.resizeWindow(1600, 1600);

  const escapeRegex = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const testFixtureName = escapeRegex(testObject.testRun.test.testFile.currentFixture.name);
  const testName = escapeRegex(testObject.testRun.test.name);
  const screenShotName = (typeof name === 'string' ? `${testName}_${name}` : testName).replace(/ /g,'_');

  // take actual screenshot
  await testObject.takeScreenshot(
    path.join(testObject.testRun.opts.userVariables.useVrtCiPath 
      ? BACON_CI_BASE_PATH 
      : 'screenshots',
    'actual',
    testFixtureName,
    `${screenShotName}.png`
    )
  );

  const actualScreenshotAbsolutePath = getAbsolutePathForScreenshot(
    'actual',
    testFixtureName,
    screenShotName,
    testObject.testRun.opts.userVariables.useVrtCiPath,
  );

  const baseScreenshotAbsolutePath = getAbsolutePathForScreenshot(
    'base',
    testFixtureName,
    screenShotName,
  );
  const isActualScreenshotTaken = fs.existsSync(actualScreenshotAbsolutePath);
  const isBaseScreenshotTaken = fs.existsSync(baseScreenshotAbsolutePath);

  // updateScreenshots flag can be from test/fixture metadata 
  // or passed into userVariables from the UPDATE_SCREENSHOTS env var
  const shouldUpdateScreenShot = testObject.testRun.test.meta.updateScreenshots 
    || testObject.testRun.test.testFile.currentFixture.meta.updateScreenshots
    || testObject.testRun.opts.userVariables.updateScreenshots;

  if (!isBaseScreenshotTaken || shouldUpdateScreenShot) {
    // take base screenshot
    await testObject.takeScreenshot(path.join('screenshots', 'base', testFixtureName, `${screenShotName}.png`));
    if (shouldUpdateScreenShot) {
      console.log('Screenshot updated for ' + testFixtureName + ' / ' + screenShotName);
    } else {
      console.log('Base screenshot created for ' + testFixtureName + ' / ' + screenShotName);
    }
  }

  // Do the comparison if a base and actual screenshot exist
  if (isActualScreenshotTaken && isBaseScreenshotTaken) {
    const imageDiff = new ImageDiff({
      imageOutputPath: getDiffImagePath(actualScreenshotAbsolutePath),
      imageAPath: actualScreenshotAbsolutePath,
      imageBPath: baseScreenshotAbsolutePath,
      threshold: VISUAL_REGRESSION_THRESHOLD,
    });
    
    await imageDiff.run();
    const diff = imageDiff.getDifferencePercent();
    if (!imageDiff.hasPassed()) {
      // fail test
      throw new Error(
        `Visual mismatch detected in test: ${testFixtureName}/${screenShotName}.  Difference %:${diff} Please investigate.`
      );
    }
  }
};

module.exports = compareScreenshot;