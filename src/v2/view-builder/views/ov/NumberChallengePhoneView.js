import { View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';

const NumberChallengePhoneView = View.extend({
  className: 'number-challenge-section',
  template: hbs`
     <p>
     {{i18n
      code="oie.numberchallenge.instruction"
      bundle="login"
      arguments="correctAnswer"
      $1="<span class='strong'>$1</span>"}}
     </p>
    <div class="phone no-translate">
      <div class="phone--body">
        <div class="phone--screen">
          <span class="phone--number" data-se="challenge-number">{{correctAnswer}}</span>
        </div>
        <div class="phone--home-button"></div>
      </div>
    </div>
  `,
  getTemplateData() {
    const correctAnswer = this.options.appState.get('currentAuthenticator')?.contextualData?.correctAnswer;
    return {
      correctAnswer
    };
  },
});


export default NumberChallengePhoneView;
