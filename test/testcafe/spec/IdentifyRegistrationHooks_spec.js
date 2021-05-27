import { RequestMock, RequestLogger } from 'testcafe';
import { renderWidget } from '../framework/shared';
import RegistrationPageObject from '../framework/page-objects/RegistrationPageObject';
import enrollProfile from '../../../playground/mocks/data/idp/idx/enroll-profile';
import success from '../../../playground/mocks/data/idp/idx/terminal-registration';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(enrollProfile)
  .onRequestTo('http://localhost:3000/idp/idx/enroll/new')
  .respond(success);

const logger = RequestLogger(
  /enroll/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);


fixture('Registration Hooks');

async function setup(t) {
  const registrationPage = new RegistrationPageObject(t);
  await registrationPage.navigateToPage();
  return registrationPage;
}


test.requestHooks(logger, mock)('should call settings.registration hooks onSuccess handlers', async t => {
  logger.clear();
  const registrationPage = await setup(t);

  await renderWidget({
    registration: {
      parseSchema: function(resp, onSuccess) {
        resp.find(({ name }) => name === 'userProfile.firstName').required = false;
        onSuccess(resp);
      },
      preSubmit: function(postData, onSuccess) {
        postData.userProfile.extra = 'stuff';
        onSuccess(postData);
      },
      postSubmit: function(postData, onSuccess) {
        // eslint-disable-next-line
        console.log(`made it to postSubmit ${postData}`);
        onSuccess(postData);
      },
    },
  });
  await registrationPage.fillLastNameField('bar');
  await registrationPage.fillEmailField('email@email.com');
  await registrationPage.clickRegisterButton();
  // parseSchema removes requirement on first name field
  await t.expect(registrationPage.hasFirstNameError()).notOk();
  // preSubmit
  const req = logger.requests[0].request;
  const reqBody = JSON.parse(req.body);

  await t.expect(reqBody).eql({
    stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
    userProfile: {
      lastName: 'bar',
      email: 'email@email.com',
      extra: 'stuff',
    }
  });
  // postSubmit
  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log.includes('made it to postSubmit email@email.com')).ok();
});

test.requestHooks(logger, mock)('should call settings.registration hooks onFailure handlers', async t => {
  logger.clear();
  const registrationPage = await setup(t);

  await renderWidget({
    registration: {
      parseSchema: function(resp, onSuccess, onFailure) {
        const error = {
          'errorSummary': 'My parseSchema message'
        };
        onFailure(error);
      },
      preSubmit: function(postData, onSuccess, onFailure) {
        const error = {
          'errorSummary': 'My preSubmit message'
        };
        onFailure(error);
      },
      postSubmit: function(postData, onSuccess, onFailure) {
        const error = {
          'errorSummary': 'My postSubmit message'
        };
        onFailure(error);
      },
    },
  });
  await t.expect(registrationPage.getErrorBoxText()).eql('My parseSchema message');

  await registrationPage.fillFirstNameField('xyz');
  await registrationPage.fillLastNameField('xyz');
  await registrationPage.fillEmailField('email@email.com');
  await registrationPage.clickRegisterButton();

  await t.expect(registrationPage.getErrorBoxText()).eql('My preSubmit message');

  // no request because the form fails to submit
  await t.expect(logger.requests.length).eql(0);
});

test.requestHooks(logger, mock)('should call settings.registration.postSubmit hook\'s onFailure handler', async t => {
  logger.clear();
  const registrationPage = await setup(t);

  await renderWidget({
    registration: {
      postSubmit: function(postData, onSuccess, onFailure) {
        const error = {
          'errorSummary': 'My postSubmit message'
        };
        onFailure(error);
      },
    },
  });

  await registrationPage.fillFirstNameField('xyz');
  await registrationPage.fillLastNameField('xyz');
  await registrationPage.fillEmailField('email@email.com');
  await registrationPage.clickRegisterButton();

  const req = logger.requests[0].request;
  // there will be a POST request
  await t.expect(req.method).eql('post');
  // there will be an error box
  await t.expect(registrationPage.getErrorBoxText()).eql('My postSubmit message');
});
