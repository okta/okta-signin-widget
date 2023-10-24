const resemble = require('resemblejs');
const path = require('path');
const fs = require('fs-extra');

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
    await resemble(baseScreenshotAbsolutePath)
      .compareTo(actualScreenshotAbsolutePath)
      .scaleToSameSize()
      .ignoreAntialiasing()
      .outputSettings({
        errorColor: {
          red: 255,
          green: 0,
          blue: 255
        },
        errorType: 'movement',
        transparency: 0.3,
        largeImageThreshold: 1200,
        useCrossOrigin: false,
        outputDiff: true,
        // ignoreAreasColoredWith: {
        //   r: 255,
        //   g: 0,
        //   b: 0,
        //   a: 255
        // }
      })
      .onComplete(async data => {
        console.log(`Difference: ${data.rawMisMatchPercentage}`);
        if (data.rawMisMatchPercentage > VISUAL_REGRESSION_THRESHOLD) {
          console.log(data);
          // write a diff image
          fs.writeFileSync(
            path.join(
              path.dirname(actualScreenshotAbsolutePath),
              `${path.basename(
                actualScreenshotAbsolutePath,
                path.extname(actualScreenshotAbsolutePath)
              )}-diff.png`
            ),
            data.getBuffer()
          );

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