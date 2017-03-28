define(['okta/underscore', 'okta/handlebars'], function (_, Handlebars) {

  /**
   * @class TemplateUtil
   * @private
   */

  return {

    /**
     * @method
     * Compiles a Handlebars template
     */
    tpl: _.memoize(function (tpl) {
      /* eslint okta/no-specific-methods: 0 */
      return Handlebars.compile(tpl);
    })

  };

});
