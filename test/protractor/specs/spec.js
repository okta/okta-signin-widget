describe('Okta Sign-In Widget', function() {
  var username = element(by.name('username'));
  var password = element(by.name('password'));
  var submit = element(by.css('[value="Sign In"]'));

  beforeEach(function() {
    browser.ignoreSynchronization = true;
  });

  function getTestPage(name) {
    browser.get('http://localhost:1804/protractor/pages/' + name + '.html');
  }
  
  it('allows logging in', function() {
    getTestPage('basic');
    username.sendKeys('admin');
    password.sendKeys({{{WIDGET_BASIC_PASSWORD}}});
    submit.click();
  });
});
