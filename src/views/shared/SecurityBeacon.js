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

define(['okta', 'util/Animations'], function (Okta, Animations) {

  var _ = Okta._,
      $ = Okta.$;

  function setBackgroundImage (el, appState) {
    // NOTE: The imgSrc is returned by the server so that every
    // user has a unique image. However new and undefined user states
    // are hard coded into the css and the value returned by the server
    // is ignored.
    var imgSrc = appState.get('securityImage'),
        imgDescription = appState.get('securityImageDescription'),
        isUndefinedUser = appState.get('isUndefinedUser'),
        isNewUser = appState.get('isNewUser'),
        isSecurityImage = !isUndefinedUser && !isNewUser;

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

  function antiPhishingMessage (image, host, shown) {
    if(!image.is(':visible')){
      return;
    }

    // Show the message that the user has not logged in from this device before.
    image.qtip({
      prerender: true,
      content: {
        text: Okta.loc('primaryauth.newUser.tooltip', 'login', [_.escape(host)]),
        button: Okta.loc('primaryauth.newUser.tooltip.close', 'login')
      },
      style: {
        classes: 'okta-security-image-tooltip security-image-qtip qtip-custom qtip-shadow qtip-rounded',
        tip: {height: 12, width: 16}
      },
      position: {
        my: 'top center',
        at: 'bottom center',
        adjust: {method: 'flip', y: -22},
        viewport: $('body')
      },
      hide: {event: false, fixed: true},
      show: {event: false, delay: 200},
      events: {
        move: function(event, api) {
          if (!api.elements.target.is(':visible')) {
            api.destroy(true);
          }
        }
      }
    });
    image.qtip('toggle', shown);
  }

  function updateSecurityImage($el, appState, animate) {
    var image = $el.find('.auth-beacon-security'),
        border = $el.find('.js-auth-beacon-border'),
        hasBorder = !appState.get('isUndefinedUser'),
        hasAntiPhishing = appState.get('isNewUser'),
        radialProgressBar = $el.find('.radial-progress-bar'),
        host = appState.get('baseUrl').match(/https?:\/\/(.[^\/]+)/)[1],
        duration = 200;
    if (!animate) {
      // Do not animate the security beacon
      // This occurs when initializing the form
      setBackgroundImage(image, appState);
      border.toggleClass('auth-beacon-border', hasBorder);
      return;
    }
    // Animate loading the security beacon
    if (!hasBorder) {
      // This occurrs when appState username is blank
      // we do not yet know if the user is recognized
      image.qtip('destroy');
      image.fadeOut(duration, function () {
        setBackgroundImage(image, appState);
        border.removeClass('auth-beacon-border');
        image.fadeIn(duration);
      });
    } else {
      // Animate loading the security beacon with a loading bar for the border
      // This occurrs when the username has been checked against Okta.
      image.qtip('destroy');
      border.removeClass('auth-beacon-border');
      Animations.radialProgressBar({
        $el: radialProgressBar,
        swap: function () {
          image.fadeOut(duration, function () {
            setBackgroundImage(image, appState);
            image.fadeIn(duration);
          });
        }
      }).then(function () {
        border.addClass('auth-beacon-border');
      }).then(function () {
        antiPhishingMessage(image, host, hasAntiPhishing);
      });
    }
  }

  return Okta.View.extend({

    template: '\
    <div class="beacon-blank">\
      <div class="radial-progress-bar">\
        <div class="circle left"></div>\
        <div class="circle right"></div>\
      </div>\
    </div>\
    <div aria-live="polite" role="image" class="bg-helper auth-beacon auth-beacon-security" data-se="security-beacon">\
      <span class="accessibility-text"></span>\
      <div class="okta-sign-in-beacon-border auth-beacon-border js-auth-beacon-border">\
      </div>\
    </div>\
    ',
    className: 'js-security-beacon',

    initialize: function (options) {
      this.update = _.partial(updateSecurityImage, this.$el, options.appState);
      this.listenTo(options.appState, 'change:securityImage', this.update);
      this.listenTo(options.appState, 'loading', function (isLoading) {
        this.$el.toggleClass('beacon-loading', isLoading);
        this.removeAntiPhishingMessage();
      });
      this.options.appState.set('beaconType', 'security');

      this.listenTo(options.appState, 'navigate', this.removeAntiPhishingMessage);
    },

    postRender: function () {
      this.update(false);
    },

    equals: function (Beacon) {
      return Beacon && this instanceof Beacon;
    },

    removeAntiPhishingMessage: function () {
      var image = this.$el.find('.auth-beacon-security');
      image.qtip('destroy');
    }

  });

});
