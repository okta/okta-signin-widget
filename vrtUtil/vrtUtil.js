const path = require('path');
const fs = require('fs');
const ImageDiff = require('./ImageDiff');

const VISUAL_REGRESSION_THRESHOLD = 0.1;

const getAbsolutePathForScreenshot = (type, testFixture, testName) => (
  path.join('screenshots', type, testFixture, `${testName}.png`).normalize()
);

const doVisualRegression = async (testObject, extension) => {
  await testObject.resizeWindow(800, 800);
  if(typeof testObject === 'undefined') {
    return;
  }
  const escapeRegex = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  // const testFixtureName = testObject.fixture.name.replace(/[^\w\s]/gi, '');
  // const testName = testObject.test.name.replace(/[^\w\s]/gi, '');
  const testFixtureName = escapeRegex(testObject.fixture.name);
  const testName = escapeRegex(testObject.test.name);
  const screenShotName = typeof extension === 'string' ? `${testName} [${extension}]` : testName;

  // take actual screenshot
  await testObject.takeScreenshot(path.join('actual', testFixtureName, `${screenShotName}.png`));
  // await testObject.takeElementScreenshot('.o-form', path.join('actual', testFixtureName, `${screenShotName}.png`));

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
  // console.log(actualScreenshotAbsolutePath);
  // console.log(baseScreenshotAbsolutePath);

  if (isActualScreenshotTaken && isBaseScreenshotTaken) {
    const diff = new ImageDiff({
      imageOutputPath: path.join(
        path.dirname(actualScreenshotAbsolutePath),
        `${path.basename(
          actualScreenshotAbsolutePath,
          path.extname(actualScreenshotAbsolutePath)
        )}-diff.png`
      ),
      imageAPath: actualScreenshotAbsolutePath,
      imageBPath: baseScreenshotAbsolutePath,
      threshold: 0.01,
    });

    diff.run(() => {
      console.log(`Difference: ${diff.getDifference()}`);
      if (!diff.hasPassed()) {
        console.log(diff);
        // write a diff image
        // fs.writeFileSync(
        //   path.join(
        //     path.dirname(actualScreenshotAbsolutePath),
        //     `${path.basename(
        //       actualScreenshotAbsolutePath,
        //       path.extname(actualScreenshotAbsolutePath)
        //     )}-diff.png`
        //   ),
        //   data.getBuffer()
        // );

        // fail test
        throw new Error(
          `Visual mismatch detected in test: ${testFixtureName}/${screenShotName}. Please investigate.`
        );
      }

      return true;
    });
  }

  if (!isBaseScreenshotTaken) {
    // take base screenshot
    await testObject.takeScreenshot(path.join('base', testFixtureName, `${screenShotName}.png`));
    // await testObject.takeElementScreenshot('.o-form', path.join('base', testFixtureName, `${screenShotName}.png`));
    // if (updateScreenshot) {
    //   console.log('Screenshot updated for ' + testFixtureName + ' / ' + testName);
    // }
  }
};

module.exports = doVisualRegression;