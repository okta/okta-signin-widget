define(['q'], function (Q) {

  function addMethodSpy (mock, methodName) {
    var spy = jasmine.createSpy(methodName + 'Spy').and.callFake(function () {
      if (!mock.__nextRes) {
        return Q.resolve({});
      }
      if (mock.__nextRes.isFulfilled() && mock.__globalSubscribeFn) {
        mock.__nextRes.then(function (res) {
          // Very specific to behavior in OktaAuth. Will remove when we remove
          // this logic
          if (res.status === 'MFA_CHALLENGE') {
            return;
          }
          mock.__globalSubscribeFn(null, res);
        });
      }
      else if (mock.__nextRes.isRejected() && mock.__globalSubscribeFn) {
        mock.__nextRes.catch(function (err) {
          mock.__globalSubscribeFn(err, null);
        });
      }
      return mock.__nextRes;
    });
    mock[methodName] = spy;
  }

  function Mock () {
    var self = this;
    this.subscribe = jasmine.createSpy('subscribeSpy').and.callFake(function (fn) {
      self.__globalSubscribeFn = fn;
    });
    addMethodSpy(this, 'primaryAuth');
    addMethodSpy(this, 'verifyFactor');
    addMethodSpy(this, 'enrollFactor');
    addMethodSpy(this, 'activateFactor');
    addMethodSpy(this, 'reactivateFactor');
    addMethodSpy(this, 'goToLink');
    addMethodSpy(this, 'post');
    addMethodSpy(this, 'getQuestions');
    addMethodSpy(this, 'changePassword');
    addMethodSpy(this, 'refreshAuthState');
    addMethodSpy(this, 'forgotPassword');
    addMethodSpy(this, 'verifySMSRecoveryCode');
    addMethodSpy(this, 'answerRecoveryQuestion');
    addMethodSpy(this, 'resetPassword');
    addMethodSpy(this, 'unlockAccount');
    addMethodSpy(this, 'getLastResponse');
  }

  Mock.prototype.__setNextResponse = function (res) {
    var isError = res.responseJSON && res.responseJSON.errorCode;
    this.__nextRes = isError ? Q.reject(res) : Q.resolve(res);
  };

  Mock.prototype.__invokeResponse = function (res) {
    this.__globalSubscribeFn(null, res);
  };

  return Mock;

});
