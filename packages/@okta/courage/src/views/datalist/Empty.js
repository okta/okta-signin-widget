
define([
  'okta/underscore',
  'shared/util/TemplateUtil',
  'shared/views/BaseView',
  'shared/util/StringUtil'
],
function (_, TemplateUtil, BaseView, StringUtil) {

  function escape(self, str) {
    return (self.state.get('empty.escape') === false || _.result(self, 'escape') === false) ? str : _.escape(str);
  }

  /**
   * @class Empty
   * @extends Okta.View
   * @private
   *
   * A view that is toggled when a datalist has no results.
   */
  return BaseView.extend({

    className: 'data-list-empty-msg',

    /**
     * Type of the component to be used by the framework
     * @readonly
     * @type {String}
     */
    type: 'empty',

    /**
     * Should the subtitle be escaped. Could also come from `this.state.get('empty.escape')`
     * @type {Boolean|Function}
     */
    escape: true,

    /**
     * Hard coded title. Could also come from `this.state.get('empty.title')`
     * @type {String|Function}
     */
    title: undefined,

    /**
     * Hard coded subtitle. Could also come from `this.state.get('empty.subtitle')`
     * @type {String|Function}
     */
    subtitle: undefined,

    template: '\
      <p class="data-list-empty-binary">\
        01101110011011110111010001101000011010010110111001100111\
        <span class="data-list-empty-img"></span>\
      </p>\
      <h4 class="data-list-head data-list-empty-head">{{title}}</h4>\
      <h5 class="data-list-head data-list-empty-head data-list-empty-subhead">{{{subtitle}}}</h5>\
    ',

    constructor: function (options) {
      var template = (options && options.template) || this.template;
      this.__template = _.isString(template) ? TemplateUtil.tpl(template) : template;

      BaseView.apply(this, arguments);

      var debounceTime = this.options.debounceTime || 200;
      var errorDebounceTime = debounceTime + 10;

      this.listenTo(this.collection, 'sync add remove reset', _.debounce(this.toggle, debounceTime));
      this.listenTo(this.collection, 'error', _.debounce(this._showError, errorDebounceTime));
      this.listenTo(this.collection, 'request', this.empty);
    },

    _showError: function (collection, jqXHR, message) {
      /* eslint max-depth: [2, 3], no-empty: 0 */
      if (collection === this.collection) {
        if (!_.isString(message)) {
          try {
            var data = jqXHR.responseJSON || JSON.parse(jqXHR.responseText);
            message = data.errorSummary;
          }
          catch (e) {}
        }
        this.__doRender(
          StringUtil.localize('datalist.error_title'),
          _.isString(message) ? message : StringUtil.localize('datalist.error_subtitle')
        );
      }
    },

    render: function () {
      return this;
    },

    __doRender: function (title, subtitle) {
      this.$el.html(this.__template({
        title: title,
        subtitle: escape(this, subtitle)
      })).show();
    },

    __getValue: function (str) {
      var res = _.result(this, str);
      if (res === false) {
        return '';
      }
      return this.state.get('empty.' + str) || res || StringUtil.localize('datalist.empty_' + str);
    },

    /**
     * Show the view when the function returns true.
     * By default it is true when collection is empty, otherwise it is false.
     * @type {Function}
     */
    isEmptyState: function () {
      return this.collection.size() === 0;
    },

    toggle: function () {
      if (this.isEmptyState()) {
        this.__doRender(this.__getValue('title'), this.__getValue('subtitle'));
      }
      else {
        this.empty();
      }
      return this;
    },

    empty: function () {
      this.$el.empty().hide();
    }

  });
});
