exports.config = {
  framework: 'jasmine2',
  seleniumServerJar: '../../node_modules/webdriver-manager/selenium/selenium-server-standalone-2.53.1.jar',
  specs: ['specs/*.js'],
  capabilities: {
    'browserName': 'phantomjs',
    'phantomjs.binary.path': require('phantomjs').path,
    'phantomjs.ghostdriver.cli.args': ['--loglevel=DEBUG']
  }
}
