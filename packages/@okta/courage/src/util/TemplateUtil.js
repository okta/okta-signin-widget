define(['okta/underscore', 'okta/handlebars'], function (_, Handlebars) {

  /**
   * @class module:Okta.internal.util.TemplateUtil
   * @hideconstructor
   */
  return /** @lends module:Okta.internal.util.TemplateUtil */ {

    /**
     * Compiles a Handlebars template
     * @static
     * @method
     */
    tpl: _.memoize(function (tpl) {
      /* eslint okta/no-specific-methods: 0 */
      return Handlebars.compile(tpl);
    })

  };

});
