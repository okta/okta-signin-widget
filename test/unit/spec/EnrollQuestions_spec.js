/*jshint maxparams:18 */
define([
  'vendor/lib/q',
  'underscore',
  'jquery',
  '@okta/okta-auth-js/jquery',
  'helpers/mocks/Util',
  'helpers/dom/EnrollQuestionsForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'LoginRouter',
  'util/BrowserFeatures',
  'util/Util',
  'sandbox',
  'helpers/xhr/MFA_ENROLL_allFactors',
  'helpers/xhr/MFA_ENROLL_question_questions',
  'helpers/xhr/MFA_ENROLL_question_error',
  'helpers/xhr/SUCCESS',
  'helpers/xhr/labels_login_ja',
  'helpers/xhr/labels_country_ja'
],
function (Q, _, $, OktaAuth, Util, Form, Beacon, Expect, Router, BrowserFeatures, LoginUtil,
          $sandbox, resAllFactors, resQuestions, resError, resSuccess, labelsLoginJa, labelsCountryJa) {

  var itp = Expect.itp,
      itpa = Expect.itpa,
      tick = Expect.tick;

  Expect.describe('EnrollQuestions', function () {

    function setup(startRouter, languagesResponse) {
      var setNextResponse = Util.mockAjax();
      var baseUrl = 'https://foo.com';
      var authClient = new OktaAuth({url: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR});
      var router = new Router({
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        globalSuccessFn: function () {}
      });
      Util.registerRouter(router);
      Util.mockRouterNavigate(router, startRouter);
      return tick()
      .then(function () {
        setNextResponse(resAllFactors);
        if (languagesResponse) {
          setNextResponse(languagesResponse);
        }
        router.refreshAuthState('dummy-token');
        return Expect.waitForEnrollChoices();
      })
      .then(function () {
        setNextResponse(resQuestions);
        router.enrollQuestion();
        return Expect.waitForEnrollQuestion({
          router: router,
          beacon: new Beacon($sandbox),
          form: new Form($sandbox),
          ac: authClient,
          setNextResponse: setNextResponse
        });
      });
    }

    function setupWithLanguage(startRouter) {
      spyOn(BrowserFeatures, 'getUserLanguages').and.returnValue(['ja', 'en']);
      return setup(startRouter, [
        _.extend({ delay: 0 }, labelsLoginJa),
        _.extend({ delay: 0 }, labelsCountryJa)
      ]);
    }

    itpa('displays the correct factorBeacon', function () {
      return setup().then(function (test) {
        expect(test.beacon.isFactorBeacon()).toBe(true);
        expect(test.beacon.hasClass('mfa-okta-security-question')).toBe(true);
      });
    });
    itp('does not allow autocomplete', function () {
      return setup().then(function (test) {
        expect(test.form.getAnswerAutocomplete()).toBe('off');
      });
    });
    itp('has a list of questions to choose from', function () {
      return setup().then(function (test) {
        var questions = test.form.questionList();
        expect(questions.length).toBe(20);
        expect(questions[0]).toEqual({
          text: 'What is the food you least liked as a child?',
          val: 'disliked_food'
        });
        expect(questions[1]).toEqual({
          text: 'What is the name of your first stuffed animal?',
          val: 'name_of_first_plush_toy'
        });
      });
    });
    itpa('has a localized list of questions if language is specified', function () {
      return setupWithLanguage().then(function (test) {
        var questions = test.form.questionList();
        expect(questions.length).toBe(20);
        expect(questions[0]).toEqual({
          text: 'JA: What is the food you least liked as a child?',
          val: 'disliked_food'
        });
      });
    });
    itp('fallbacks to English if the question is not in the specified language bundle', function () {
      return setupWithLanguage().then(function (test) {
        var questions = test.form.questionList();
        expect(questions.length).toBe(20);
        expect(questions[1]).toEqual({
          text: 'What is the name of your first stuffed animal?',
          val: 'name_of_first_plush_toy'
        });
      });
    });
    itp('has an answer text box', function () {
      return setup().then(function (test) {
        var answer = test.form.answerField();
        expect(answer.length).toBe(1);
        expect(answer.attr('type')).toEqual('text');
      });
    });
    itp('returns to factor list when browser\'s back button is clicked', function () {
      return setup(true).then(function (test) {
        Util.triggerBrowserBackButton();
        return Expect.waitForEnrollChoices(test);
      })
      .then(function (test) {
        Expect.isEnrollChoices(test.router.controller);
        Util.stopRouter();
      });
    });
    itpa('calls enroll with the right arguments when save is clicked', function () {
      return setup().then(function (test) {
        $.ajax.calls.reset();
        test.form.selectQuestion('favorite_security_question');
        test.form.setAnswer('No question! Hah!');
        test.setNextResponse(resSuccess);
        test.form.submit();
        return tick();
      })
      .then(function () {
        expect($.ajax.calls.count()).toBe(1);
        Expect.isJsonPost($.ajax.calls.argsFor(0), {
          url: 'https://foo.com/api/v1/authn/factors',
          data: {
            factorType: 'question',
            provider: 'OKTA',
            profile: {
              question: 'favorite_security_question',
              answer: 'No question! Hah!'
            },
            stateToken: 'testStateToken'
          }
        });
      });
    });
    itpa('validates answer field and errors before the request', function () {
      return setup().then(function (test) {
        $.ajax.calls.reset();
        test.form.submit();
        expect(test.form.hasErrors()).toBe(true);
        expect($.ajax).not.toHaveBeenCalled();
      });
    });
    itpa('shows error if error response on enrollment', function () {
      return setup()
      .then(function (test) {
        Q.stopUnhandledRejectionTracking();
        test.setNextResponse(resError);
        test.form.setAnswer('the answer');
        test.form.submit();
        return tick(test);
      })
      .then(function (test) {
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.errorMessage()).toBe('Invalid Profile.');
      });
    });
    itp('returns to factor list when back link is clicked', function () {
      return setup().then(function (test) {
        test.form.backLink().click();
        expect(test.router.navigate.calls.mostRecent().args)
          .toEqual(['signin/enroll', { trigger: true }]);
      });
    });

  });

});
