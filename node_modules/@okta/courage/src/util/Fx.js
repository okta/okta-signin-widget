/**
 * Animation manager class.
 *
 * @Singleton
 */
define([
  'okta/underscore'
], function (_) {

  var effects = {
    NONE: 'none',
    SLIDE: 'slide',
    FADE: 'fade'
  };

  return {

    DEFAULT_DURATION: 400, // jQuery's default duration

    EFFECTS: effects,

    /**
     * Function to run an animation on an element.
     *
     * @param el - jquery element
     * @param options - {Object} animation options - can be any of the options supported by jquery UI.
     *                           For more documentation, visit - http://api.jqueryui.com/effect/
     * (options.effect) - {String} Effect name supported in Fx.EFFECTS.
     *
     * Note - This class has just the 'slide' animation for now. But this is a good starting point
     * for a transition/animation manager with a set of animations.
     */
    animate: function (el, options) {
      options || (options = {});
      if (_.isString(options)) {
        options = {
          effect: options
        };
      }

      switch (options.effect) {
      case effects.SLIDE:
      case effects.FADE:
        // Hide initially (For 'toggle' to work).
        el.hide();
        el.toggle(options);
        break;

      case effects.NONE:
        break;

      default:
        break;
      }
    }
  };


});
