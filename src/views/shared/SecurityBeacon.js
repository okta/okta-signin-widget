/*!
 * Okta Sign-In Widget SDK LEGAL NOTICES
 *
 * The Okta software accompanied by this notice is provided pursuant to the
 * following terms:
 *
 * Copyright © 2015, Okta, Inc. Licensed under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0. Unless required by applicable
 * law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * The Okta software accompanied by this notice has build dependencies on
 * certain third party software licensed under separate terms ("Third Party
 * Components").
 *
 * Okta makes the following disclaimers regarding the Third Party Components on
 * behalf of itself, the copyright holders, contributors, and licensors of such
 * Third Party Components:
 * TO THE FULLEST EXTENT PERMITTED UNDER APPLICABLE LAW, THE THIRD PARTY
 * COMPONENTS ARE PROVIDED BY THE COPYRIGHT HOLDERS, CONTRIBUTORS, LICENSORS,
 * AND OKTA "AS IS" AND ANY REPRESENTATIONS OR WARRANTIES OF ANY KIND, WHETHER
 * ORAL OR WRITTEN, WHETHER EXPRESS, IMPLIED, OR ARISING BY STATUTE, CUSTOM,
 * COURSE OF DEALING, OR TRADE USAGE, INCLUDING WITHOUT LIMITATION THE IMPLIED
 * WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
 * NON-INFRINGEMENT, ARE DISCLAIMED. IN NO EVENT WILL THE COPYRIGHT OWNER,
 * CONTRIBUTORS, LICENSORS, OR OKTA BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION), HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THE THIRD
 * PARTY COMPONENTS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

define(['okta', 'util/Animations'], function (Okta, Animations) {

  var _ = Okta._,
      $ = Okta.$;

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

  function setBackgroundImage (el, appState) {
    // NOTE: The imgSrc is returned by the server so that every
    // user has a unique image. However new and undefined user states
    // are hard coded into the css and the value returned by the server
    // is ignored.
    var imgSrc = appState.get('securityImage'),
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
      el.css('background-image', 'url(' + _.escape(imgSrc) + ')');
      return;
    }
  }

  function antiPhishingMessage (image, host, shown) {
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
      show: {event: false, delay: 200}
    });
    image.qtip('toggle', shown);
  }

  return Okta.View.extend({

    template: '\
    <div class="beacon-blank">\
      <div class="radial-progress-bar">\
        <div class="circle left"></div>\
        <div class="circle right"></div>\
      </div>\
    </div>\
    <div class="bg-helper auth-beacon auth-beacon-security" data-se="security-beacon">\
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
      });
    },

    postRender: function () {
      this.update(false);
    },

    equals: function (Beacon) {
      return Beacon && this instanceof Beacon;
    }

  });

});
