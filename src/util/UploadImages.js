/* global Promise */
'use strict';

var fs = require('fs');
var Eyes = require('@applitools/eyes-images').Eyes;

var eyes = new Eyes();
var ConsoleLogHandler = require('@applitools/eyes-images').ConsoleLogHandler;
eyes.setLogHandler(new ConsoleLogHandler(true));
eyes.setApiKey(process.env.APPLITOOLS_API_KEY);
const TestResultsFormatter = require('@applitools/eyes-images').TestResultsFormatter;

eyes.setBatch('Okta Sign-in Widget');
eyes.setHostOS('Mac OS X 10.14');
eyes.setHostApp('PhantomJS');

const waitFor = (ms) => new Promise(r => setTimeout(r, ms));

async function asyncForEach (array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const screenshotsDir = './.tmp/screenshots/';

fs.readdir(screenshotsDir, function ( err, files ) {
  const start = async () => {
    await asyncForEach(files, async (file) => {

      await waitFor(50);
      var image = fs.readFileSync(screenshotsDir + file);

      var firstTestPromise = eyes.open('Okta Sign-in Widget', file).then(function () {
        return eyes.checkImage(image, file);
      }).then(function () {
        return eyes.close(false);
      }, function () {
        return eyes.abortIfNotClosed();
      });

      await firstTestPromise.then(function (results) {
        var testResultsFormatter = new TestResultsFormatter();
        testResultsFormatter.addResults(results);
      });
    });
  };
  start();
});
