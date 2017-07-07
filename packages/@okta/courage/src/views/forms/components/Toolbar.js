define([
  'okta/underscore',
  'shared/views/BaseView',
  '../helpers/FormUtil'
], function (_, BaseView, FormUtil) {

  return BaseView.extend({

    className: 'o-form-button-bar',

    initialize: function (options) {
      this.addButton({
        type: 'save',
        text: _.resultCtx(options, 'save', this),
        id: _.resultCtx(options, 'saveId', this),
        className: _.resultCtx(options, 'saveClassName', this)
      });

      if (!options.noCancelButton) {
        this.addButton({type: 'cancel', text: _.resultCtx(options, 'cancel', this)});
      }

      if (options.hasPrevStep) {
        this.addButton({type: 'previous'}, {prepend: true});
      }
    },

    /**
     * Adds a buttomn to the toolbar
     * @param {Object} params button parameters
     * @param {Object} options {@link Okta.View#add} options
     */
    addButton: function (params, options) {
      return this.add(FormUtil.createButton(params), options);
    }

  });

});
