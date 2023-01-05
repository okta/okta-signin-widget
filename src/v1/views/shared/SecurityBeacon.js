/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { _, $, loc, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import Animations from 'util/Animations';

function setBackgroundImage(el, appState) {
  const imgSrc = appState.get('securityImage');
  const imgDescription = appState.get('securityImageDescription');
  const isUndefinedUser = appState.get('isUndefinedUser');
  const isNewUser = appState.get('isNewUser');
  const isSecurityImage = !isUndefinedUser && !isNewUser;
  // NOTE: The imgSrc is returned by the server so that every
  // user has a unique image. However new and undefined user states
  // are hard coded into the css and the value returned by the server
  // is ignored.

  el.css('background-image', '');
  el.removeClass('new-user undefined-user');
  if (isNewUser) {
    el.addClass('new-user');
    return;
  }
  if (isUndefinedUser) {
    el.addClass('undefined-user');
    return;
  }
  if (isSecurityImage) {
    // TODO: Newer versions of qtip will remove aria-describedby on their own when destroy() is called.
    el.removeAttr('aria-describedby');
    el.find('.accessibility-text').text(imgDescription);
    el.css('background-image', 'url(' + _.escape(imgSrc) + ')');
    return;
  }
}

function antiPhishingMessage(image, host) {
  $(window).on(
    'resize.securityBeaconQtip',
    _.debounce(function() {
      if (image.is(':visible')) {
        image.qtip('show');
      }
    }, 300)
  );

  // Show the message that the user has not logged in from this device before.
  image.qtip({
    prerender: true,
    content: {
      text: loc('primaryauth.newUser.tooltip', 'login', [_.escape(host)]),
      button: loc('primaryauth.newUser.tooltip.close', 'login'),
    },
    style: {
      classes: 'okta-security-image-tooltip security-image-qtip qtip-custom qtip-shadow qtip-rounded',
      tip: { height: 12, width: 16 },
    },
    position: {
      my: 'top center',
      at: 'center',
      target: $('.auth-beacon-security'),
      adjust: { method: 'flip', scroll: false, resize: true },
      effect: false,
    },
    hide: { event: false, fixed: true },
    show: { event: false, delay: 200 },
    events: {
      move: function(event, api) {
        if (!api.elements.target.is(':visible')) {
          // Have to hide it immediately, with no effect
          api.set('hide.effect', false);
          api.hide();
          api.set('hide.effect', true);
        }
      },
    },
  });

  // It is necessary to delay toggle to the next render cycle, since qtip internally defers some setup tasks.
  setTimeout(() => {
    image.qtip('toggle', image.is(':visible'));
  }, 0);
}

function destroyAntiPhishingMessage(image) {
  image.qtip('destroy');
  $(window).off('resize.securityBeaconQtip');
}

async function updateSecurityImage($el, appState, animate) {
  const image = $el.find('.auth-beacon-security');
  const border = $el.find('.js-auth-beacon-border');
  const hasBorder = !appState.get('isUndefinedUser');
  const hasAntiPhishing = appState.get('isNewUser');
  const radialProgressBar = $el.find('.radial-progress-bar');
  const host = appState.get('baseUrl').match(/https?:\/\/(.[^/]+)/)[1];
  const duration = 200;

  if (!animate) {
    // Do not animate the security beacon
    // This occurs when initializing the form
    setBackgroundImage(image, appState);
    border.toggleClass('auth-beacon-border', hasBorder);
    return;
  }

  destroyAntiPhishingMessage(image);

  // Animate loading the security beacon
  if (!hasBorder) {
    // This occurs when appState username is blank
    // we do not yet know if the user is recognized
    image.fadeOut(duration, function() {
      setBackgroundImage(image, appState);
      border.removeClass('auth-beacon-border');
      image.fadeIn(duration);
    });
  } else {
    // Animate loading the security beacon with a loading bar for the border
    // This occurs when the username has been checked against Okta.
    border.removeClass('auth-beacon-border');
    await Animations.radialProgressBar({
      $el: radialProgressBar,
      swap() {
        image.fadeOut(duration, () => {
          setBackgroundImage(image, appState);
          image.fadeIn(duration);
        });
      },
    });
    border.addClass('auth-beacon-border');
    if (hasAntiPhishing) {
      antiPhishingMessage(image, host);
    }
  }
}

export default View.extend({
  template: hbs(
    '\
    <div class="beacon-blank">\
      <div class="radial-progress-bar">\
        <div class="circle left"></div>\
        <div class="circle right"></div>\
      </div>\
    </div>\
    <div aria-live="polite" role="img" class="bg-helper auth-beacon auth-beacon-security" data-se="security-beacon">\
      <span class="accessibility-text"></span>\
      <div class="okta-sign-in-beacon-border auth-beacon-border js-auth-beacon-border">\
      </div>\
    </div>\
    '
  ),
  className: 'js-security-beacon',

  initialize: function(options) {
    this.update = _.partial(updateSecurityImage, this.$el, options.appState);
    this.listenTo(options.appState, 'change:securityImage', this.update);
    this.listenTo(options.appState, 'loading', function(isLoading) {
      this.$el.toggleClass('beacon-loading', isLoading);
      this.removeAntiPhishingMessage();
    });
    this.options.appState.set('beaconType', 'security');

    this.listenTo(options.appState, 'navigate', this.removeAntiPhishingMessage);
  },

  postRender: function() {
    this.update(false);
  },

  equals: function(Beacon) {
    return Beacon && this instanceof Beacon;
  },

  removeAntiPhishingMessage: function() {
    const image = this.$el.find('.auth-beacon-security');

    image.qtip('destroy');
  },
});
