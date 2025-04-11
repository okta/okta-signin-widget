/* eslint-disable */
const TestRunner = require('jest-runner');

class SerialRunner extends TestRunner {
  constructor(...args) {
    super(...args);
    this.isSerial = true; // Indicate that tests should run serially
  }
}

module.exports = SerialRunner;
