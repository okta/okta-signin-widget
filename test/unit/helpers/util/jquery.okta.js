import { $ } from 'okta';

$.fn.trimmedText = function() {
  return $.trim(this.text());
};

$.fn.isInViewport = function() {
  if (!this.length) {
    return false;
  }

  var elementTop = $(this).offset().top;
  var elementBottom = elementTop + $(this).outerHeight();

  var viewportTop = $(window).scrollTop();
  var viewportBottom = viewportTop + $(window).height();

  return elementBottom > viewportTop && elementTop < viewportBottom;
};
