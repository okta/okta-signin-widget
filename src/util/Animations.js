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

/* eslint max-statements: [2, 16] */

import Q from 'q';
import Enums from './Enums';
const SWAP_PAGE_TIME = 200;
const fn = {};

function zoom($el, start, finish) {
  const deferred = Q.defer();

  $el.animate(
    {
      'text-indent': 1,
    },
    {
      duration: 200,
      easing: 'swing',
      step: function(now, fx) {
        fx.start = start;
        fx.end = finish;
        $el.css('transform', 'scale(' + now + ', ' + now + ')');
      },
      always: function() {
        deferred.resolve($el);
      },
    }
  );
  return deferred.promise;
}

function rotate($el, start, finish) {
  const deferred = Q.defer();

  $el.animate(
    {
      'text-indent': 1,
    },
    {
      duration: 150,
      easing: 'swing',
      step: function(now, fx) {
        fx.start = start;
        fx.end = finish;
        $el.css('transform', 'rotate(' + now + 'deg)');
      },
      always: function() {
        deferred.resolve($el);
      },
    }
  );
  return deferred.promise;
}

// Note: It is necessary to pass in a success callback because we must
// remove the old dom node (and controller) in the same tick of the event
// loop. Waiting for "then" results in a glitchy animation.
fn.swapPages = function(options) {
  const deferred = Q.defer();
  const $parent = options.$parent;
  const $oldRoot = options.$oldRoot;
  const $newRoot = options.$newRoot;
  const success = options.success;
  const ctx = options.ctx;
  let directionClassName = 'transition-from-right';

  if (options.dir && options.dir === Enums.DIRECTION_BACK) {
    directionClassName = 'transition-from-left';
  }

  $newRoot.addClass(directionClassName);
  $parent.append($newRoot);

  $parent.addClass('animation-container-overflow');
  const newRootAnimations = { left: '0px', top: '0px', opacity: 1 };
  $newRoot.animate(newRootAnimations, SWAP_PAGE_TIME, function() {
    $parent.removeClass('animation-container-overflow');
    $newRoot.removeClass(directionClassName);
    const clearStyles = Object.keys(newRootAnimations).reduce((styles, attr) => ({ ...styles, [attr]: '' }), {});
    $newRoot.css(clearStyles);
    success.call(ctx);
    deferred.resolve();
  });

  $oldRoot.animate({ height: $newRoot.height(), opacity: 0 }, SWAP_PAGE_TIME * 0.8);

  return deferred.promise;
};

fn.swapBeacons = function(options) {
  const $el = options.$el;
  const swap = options.swap;
  const ctx = options.ctx;

  return this.implode($el)
    .then(function() {
      swap.call(ctx);
      return $el;
    })
    .then(this.explode);
};

fn.explode = function($el) {
  return zoom($el, 0, 1); //zoom in
};

fn.implode = function($el) {
  return zoom($el, 1, 0); //zoom out
};

fn.radialProgressBar = function(options) {
  const radialProgressBar = options.$el;
  const swap = options.swap;
  const circles = radialProgressBar.children();

  return rotate(circles, 0, 180)
    .then(function() {
      radialProgressBar.css({ clip: 'auto' });
    })
    .then(function() {
      const leftHalf = circles.eq(0);

      swap();
      return rotate(leftHalf, 180, 360);
    })
    .then(function() {
      //reset values to initial state
      radialProgressBar.css({ clip: 'rect(0px, 96px, 96px, 48px)' });
      circles.css({
        transform: 'rotate(0deg)',
        'text-indent': '1px',
      });
    });
};

export default fn;
