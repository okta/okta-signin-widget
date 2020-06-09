const fs = require('fs');
const cheerio = require('cheerio');
const got = require('got');
const chromeDriverDownloadUrl = 'https://chromedriver.chromium.org/downloads';
const { execSync } = require('child_process');

let chromeVersion;
let chromeDriverVersion;
let foundDriverVersion = false;

function getOS() {
  var os = process.platform;
  if (os == "darwin") {
    os = "MacOS";
  } else if (os == "win32" || os == "win64") {
    os = "Windows";
  } else if (os == "linux") {
    os = "Linux";
  }
  return os;
}

got(chromeDriverDownloadUrl).then(async(response) => {
  os = getOS();
  console.log(`Operating System - ${os}`);

  if (os === 'MacOS') {
    chromeVersionString = execSync(`/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --version`) + '';
    // Example output of chromeVersionString - Google Chrome 83.0.4103.97
    // Split this string by spaces to get the version number
    chromeVersion = chromeVersionString.split(" ")[2];
  } else {
    chromeVersion = execSync(`google-chrome --product-version`) + '';
  }

  console.log(`Chrome Version - ${chromeVersion}`);

  const $ = cheerio.load(response.body);

  // Chromedriver download URLs are of the form https://chromedriver.storage.googleapis.com/index.html?path=83.0.4103.39/
  // Filter through all href of this format, depending on the chrome version installed and get the chrome driver version from that
  $('a').filter(isChromeDriverDownloadUrl).each((i, link) => {
    const href = link.attribs.href;
    if (foundDriverVersion === false) {
      foundDriverVersion = true;
      // Extracting the chromedriver version from "xxxxx.html?path=83.0.4103.39/"
   	  chromeDriverVersion = href.substr(href.indexOf('=') + 1, href.length - href.indexOf('=') - 2);
   	  console.log(`Chrome Driver Version - ${chromeDriverVersion}`);

   	  execSync(`${__dirname}/../node_modules/protractor/bin/webdriver-manager update --versions.chrome ${chromeDriverVersion} --gecko false --versions.standalone latest`);
    }
  });
}).catch(err => {
  console.log(err);
});

const isChromeDriverDownloadUrl = (i, link) => {
  // Get the major version of chrome in res[0]
  const res = chromeVersion.split(".");

  if(typeof link.attribs.href === 'undefined') { return false }

  // Return the link if it contains path=<major version>
  return link.attribs.href.includes("path=" + res[0]);
};
