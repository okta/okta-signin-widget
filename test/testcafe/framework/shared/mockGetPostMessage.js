// the method __get$PostMessage is used by testcafe hammerhead script to communicate between the recaptcha iframe and the testcafe server
// it causes a MessagePort cloning error when SIW loads the recaptcha script.  
// Since we don't need testcafe to communicate with the recaptcha iframe for the test to function,
// we work around this by overriding window.__get$PostMessage with a dummy function at the beginning of a recaptcha test.
Object.defineProperty(window, '__get$PostMessage', {
  value: function() {
    return function() {};
  }
});