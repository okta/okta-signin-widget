define([
  'okta/underscore',
  'shared/util/TemplateUtil',
  'shared/util/Logger',
  'shared/views/BaseView'
],
function (_, TemplateUtil, Logger, BaseView) {

  function extendsBaseView(obj) {
    return obj instanceof BaseView || obj.prototype instanceof BaseView;
  }

  /**
   * @class InputContainer
   * @private
   *
   * TODO: OKTA-80796
   * Attention: Please change with caution since this is used in other places
   */
  return BaseView.extend({

    attributes: function () {
      return {
        'data-se': 'o-form-input-container'
      };
    },

    className: function () {
      var className = 'o-form-input';
      if (this.options.wide) {
        className += ' o-form-wide';
      }
      if (_.contains([1, 2, 3, 4], this.options.multi)) {
        className += ' o-form-multi-input-' + this.options.multi;
        if (_.isArray(this.options.input)) {
          var inputGroup = _.find(this.options.input, function (input) {
            return _.contains(['text+select', 'select+text'], input.options.type);
          });
          inputGroup && (className += ' o-form-multi-input-group-' + this.options.multi);
        }
      }
      return className;
    },

    _getNames: function () {
      /*eslint complexity: 0 */
      var names = _.isArray(this.options.name) ? this.options.name : [this.options.name];
      if (this.options.type == 'group') {
        names.push.apply(names, _.pluck(this.options.input[0].options.params.inputs, 'name'));
      }
      else if (_.isArray(this.options.name)) {
        if (this.options.input && this.options.input.options && this.options.input.options.name) {
          names.push(this.options.input.options.name);
        }
      }
      else if (this.options.input) {
        if (_.isArray(this.options.input)) {
          _.each(this.options.input, function (inputItem) {
            names.push(inputItem.options.name);
          });
        }
        else {
          names.push(this.options.input.options.name);
        }
      }
      return _.uniq(_.compact(names));
    },

    constructor: function () {
      /* eslint max-statements: [2, 18] */
      BaseView.apply(this, arguments);

      // we want to append the input *before* the explain text
      if (this.options.input) {
        if (_.isArray(this.options.input)) {
          _.each(this.options.input, function (inputItem) {
            this.add(inputItem, {prepend: true});
          }, this);
        } else {
          this.add(this.options.input, {prepend: true});
        }
      }

      this.__setExplain(this.options);

      var names = this._getNames();

      this.listenTo(this.model, 'form:field-error', function (name, errors) {
        if (_.contains(names, name)) {
          this.__setError(errors);
        }
      });

      this.listenTo(this.model, 'form:clear-errors change:' + names.join(' change:'), this.__clearError);
      this.listenTo(this.model, 'form:clear-error:' + names.join(' form:clear-error:'), this.__clearError);

      if (_.resultCtx(this.options, 'autoRender', this)) {
        this.listenTo(this.model, 'change:' + this.options.name, this.render);
      }

      this.__errorState = false;

    },

    /**
     * Populates the explain on the input container (if it exists). There are
     * two ways to use this:
     * 1. Raw text - wraps in the correct html template
     * 2. Custom html
     *    - pass in a View class (preferred)
     *    - pass in an instance of a View
     * Some additional notes:
     * - You can pass a function that returns any of the above
     * - This maintains support for the deprecated "customExplain" property
     *   that was used before. This pattern is superseded by explain, so use
     *   that instead.
     * @private
     */
    __setExplain: function (options) {
      var explain;

      // Deprecated - if you need custom html, use explain instead
      if (options.customExplain) {
        Logger.warn('Deprecated - use explain instead of customExplain');
        this.add(this.options.customExplain);
        return;
      }

      explain = options.explain;
      if (_.isFunction(explain) && !extendsBaseView(explain)) {
        explain = _.resultCtx(this.options, 'explain', this);
      }
      if (!explain) {
        return;
      }

      if (extendsBaseView(explain)) {
        this.template = '<p class="o-form-explain"></p>';
        this.add(explain, '.o-form-explain');
      }
      else {
        this.template = '<p class="o-form-explain">{{explain}}</p>';
      }
    },

    /**
     * Highlight the input as invalid (validation failed)
     * Adds an explaination message of the error
     * @private
     */
    __setError: function (errors) {

      this.__errorState = true;
      this.$el.addClass('o-form-has-errors');

      var tmpl = [
        '<p class="okta-form-input-error o-form-input-error o-form-explain" role="alert">',
        '<span class="icon icon-16 error-16-small"></span>',
        '{{text}}',
        '</p>'
      ].join('');

      var html = TemplateUtil.tpl(tmpl)({text: errors.join(', ')});
      var $elExplain = this.$('.o-form-explain').not('.o-form-input-error').first();

      if ($elExplain.length) {
        $elExplain.before(html);
      }
      else {
        this.$el.append(html);
      }


    },

    /**
     * Un-highlight the input and remove explaination text
     * @private
     */
    __clearError: function () {
      if (this.__errorState) {
        this.$('.o-form-input-error').remove();
        this.$el.removeClass('o-form-has-errors');
        this.__errorState = false;
        _.defer(_.bind(function () {
          this.model.trigger('form:resize');
        }, this));
      }
    },


    focus: function () {
      this.each(function (view) {
        if (view.focus) {
          return view.focus();
        }
      });

      return this;
    }

  });

});
