import { View, loc, createButton } from 'okta';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import BaseFooter from '../internals/BaseFooter';
import Util from '../../../util/Util';

const Body = BaseForm.extend({

  title: loc('primaryauth.title'),
  save: loc('oform.next', 'login'),
  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);
    if (this.options.appState.hasRemediationForm('launch-authenticator')) {
      this.add(View.extend({
        className: 'sign-in-with-device-option',
        template: `
          <div class="okta-verify-container"></div>
          <div class="separation-line"><span>OR</span></div>
        `,
        initialize () {
          const appState = this.options.appState;
          this.listenTo(this.options.appState, 'launch-universal-link', () => {
            const deviceChallenge = this.options.appState.get(
              this.options.appState.getCurrentViewState().relatesTo
            );
            Util.redirect(deviceChallenge.href); 
            // Util.redirect('https://z9pm.adj.st/my/path?adjust_t=klm012&adjust_campaign=Getaway_Vacation_Campaign_2-0&adjust_adgroup=35-42&adjust_creative=island_sunset');
          });
          this.add(createButton({
            className: 'button-secondary',
            title: 'Sign in using Okta Verify',
            click () { 
              appState.trigger('invokeAction', 'launch-authenticator');
            }
          }), '.okta-verify-container');
        }
      }), '.o-form-fieldset-container', false, true);
    }
  }
});

const Footer = BaseFooter.extend({
  links () {
    const baseUrl = this.options.settings.get('baseUrl');
    let href = baseUrl + '/help/login';
    if (this.options.settings.get('helpLinks.help') ) {
      href = this.options.settings.get('helpLinks.help');
    }
    const signupLinkObj = {
      'type': 'link',
      'label': 'Sign up',
      'name': 'enroll',
      'actionPath': 'select-enroll-profile',
    };
    const links = [
      {
        'name': 'help',
        'label': 'Need help signing in?',
        'href': href,
      },
    ];
    if (this.options.appState.hasRemediationForm('select-enroll-profile')) {
      links.push(signupLinkObj);
    }
    return links;
  }
});

export default BaseView.extend({
  Body,
  Footer,
});
