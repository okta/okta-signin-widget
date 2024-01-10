const path = require('path');
const fs = require('fs');
const ImageDiff = require('./ImageDiff');

// Max image difference allowed as a percentage. ie. 0.01 = 0.01%
const MAX_DIFF_PERCENT = 0.01;
const BASE_PATH = path.join('screenshots');

const getActualScreenshotPath = (testFixture, testName) => (
  path.join(BASE_PATH, 'actual', testFixture, `${testName}.png`).normalize()
);

const getBaseScreenshotPath = (testFixture, testName) => (
  path.join('screenshots', 'base', testFixture, `${testName}.png`).normalize()
);

const getBaseScreenshotPathLocal = (testFixture, testName) => (
  path.join(BASE_PATH, 'base', testFixture, `${testName}.png`).normalize()
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

  const { fullPage, strictMode, name } = options;
  const escapeRegex = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const testFixtureName = escapeRegex(testObject.testRun.test.testFile.currentFixture.name).replace(/ /g,'_');
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
  // if vrt is executed locally we get base screenshots from the build2/reports directory
  // that is generated after running the update screenshots command.
  // this is because the bacon ci base screens were generated in a different enviroment and will fail
  const baseScreenshotAbsolutePath = testObject.testRun.opts.userVariables.vrtCi 
    ? getBaseScreenshotPath(testFixtureName, screenShotName)
    : getBaseScreenshotPathLocal(testFixtureName, screenShotName);
  const isActualScreenshotTaken = fs.existsSync(actualScreenshotAbsolutePath);
  const isBaseScreenshotTaken = fs.existsSync(baseScreenshotAbsolutePath);

  // updateScreenshots flag can come from test/fixture metadata 
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
      console.log('Base screenshot for ' + testFixtureName + ' / ' + screenShotName + 
      ' has been created in the test report.  Please add this screenshot to a commit and push it to the repo.');
      return;
    }

    throw new Error(
      `No base screenshot found for: ${testFixtureName}/${screenShotName}.  
      Please find the base screenshot in the test report and add it to the repo.`
    );
  }

  // Do the comparison if a base and actual screenshot exist
  if (isActualScreenshotTaken && isBaseScreenshotTaken && !shouldUpdateScreenShot) {
    const imageDiff = new ImageDiff({
      imageOutputPath: getDiffImagePath(actualScreenshotAbsolutePath),
      imageAPath: actualScreenshotAbsolutePath,
      imageBPath: baseScreenshotAbsolutePath,
      maxDiff: MAX_DIFF_PERCENT,
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