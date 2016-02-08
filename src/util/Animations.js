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

define(['vendor/lib/q', './Enums'], function (Q, Enums) {

  var SWAP_PAGE_TIME = 200;

  var fn = {};

  // Note: It is necessary to pass in a success callback because we must
  // remove the old dom node (and controller) in the same tick of the event
  // loop. Waiting for "then" results in a glitchy animation.
  fn.swapPages = function (options) {
    var deferred = Q.defer();
    var $parent = options.$parent;
    var $oldRoot = options.$oldRoot;
    var $newRoot = options.$newRoot;
    var success = options.success;
    var ctx = options.ctx;
    var directionClassName = 'transition-from-right';

    if (options.dir && options.dir === Enums.DIRECTION_BACK) {
      directionClassName = 'transition-from-left';
    }

    $newRoot.addClass(directionClassName);
    $parent.append($newRoot);

    $parent.addClass('animation-container-overflow');
    $newRoot.animate(
      { left: '0px', top: '0px', opacity: 1 },
      SWAP_PAGE_TIME,
      function () {
        $parent.removeClass('animation-container-overflow');
        $newRoot.removeClass(directionClassName);
        $newRoot.removeAttr('style');
        success.call(ctx);
        deferred.resolve();
      }
    );

    $oldRoot.animate(
      { height: $newRoot.height(), opacity: 0 },
      SWAP_PAGE_TIME * 0.8
    );

    return deferred.promise;
  };

  fn.swapBeacons = function (options) {
    var $el = options.$el,
        swap = options.swap,
        ctx = options.ctx;

    return this.implode($el)
    .then(function () {
      swap.call(ctx);
      return $el;
    })
    .then(this.explode);
  };

  fn.explode = function ($el) {
    return zoom($el, 0, 1); //zoom in
  };

  fn.implode = function ($el) {
    return zoom($el, 1, 0); //zoom out
  };

  fn.radialProgressBar = function (options) {
    var radialProgressBar = options.$el,
        swap = options.swap,
        circles = radialProgressBar.children();

    return rotate(circles, 0, 180)
    .then(function () {
      radialProgressBar.css({'clip': 'auto'});
    })
    .then(function () {
      var leftHalf = circles.eq(0);
      swap();
      return rotate(leftHalf, 180, 360);
    })
    .then(function () {
      //reset values to initial state
      radialProgressBar.css({'clip': 'rect(0px, 96px, 96px, 48px)'});
      circles.css({
        'transform': 'rotate(0deg)',
        'text-indent': '1px'
      });
    });
  };

  function zoom ($el, start, finish) {
    var deferred = Q.defer();
    $el.animate({
      'text-indent': 1
    }, {
      duration: 200,
      easing: 'swing',
      step: function (now, fx) {
        fx.start = start;
        fx.end = finish;
        $el.css('transform', 'scale(' + now + ', ' + now + ')');
      },
      always: function () {
        deferred.resolve($el);
      }
    });
    return deferred.promise;
  }

  function rotate ($el, start, finish) {
    var deferred = Q.defer();
    $el.animate({
      'text-indent': 1
    }, {
      duration: 150,
      easing: 'swing',
      step: function (now, fx) {
        fx.start = start;
        fx.end = finish;
        $el.css('transform', 'rotate(' + now + 'deg)');
      },
      always: function () {
        deferred.resolve($el);
      }
    });
    return deferred.promise;
  }

  return fn;

});
