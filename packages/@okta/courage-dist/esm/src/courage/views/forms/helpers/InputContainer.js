import _Handlebars2 from '../../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import oktaUnderscore from '../../../util/underscore-wrapper.js';
import Logger from '../../../util/Logger.js';
import Util from '../../../util/Util.js';
import StringUtil from '../../../util/StringUtil.js';
import BaseView from '../../BaseView.js';

const isABaseView = Util.isABaseView;
/**
 * @class InputContainer
 * @private
 *
 * TODO: OKTA-80796
 * Attention: Please change with caution since this is used in other places
 */

var InputContainer = BaseView.extend({
  attributes: function () {
    return {
      'data-se': 'o-form-input-container'
    };
  },
  className: function () {
    let className = 'o-form-input';

    if (this.options.wide) {
      className += ' o-form-wide';
    }

    if (oktaUnderscore.contains([1, 2, 3, 4], this.options.multi)) {
      className += ' o-form-multi-input-' + this.options.multi;

      if (oktaUnderscore.isArray(this.options.input)) {
        const inputGroup = oktaUnderscore.find(this.options.input, function (input) {
          return oktaUnderscore.contains(['text+select', 'select+text'], input.options.type);
        });

        inputGroup && (className += ' o-form-multi-input-group-' + this.options.multi);
      }
    }

    return className;
  },
  _getNames: function () {
    const names = oktaUnderscore.isArray(this.options.name) ? this.options.name : [this.options.name];
    /*eslint complexity: 0 */

    if (this.options.type === 'group') {
      names.push.apply(names, oktaUnderscore.pluck(this.options.input[0].options.params.inputs, 'name'));
    } else if (oktaUnderscore.isArray(this.options.name)) {
      if (this.options.input && this.options.input.options && this.options.input.options.name) {
        names.push(this.options.input.options.name);
      }
    } else if (this.options.input) {
      if (oktaUnderscore.isArray(this.options.input)) {
        oktaUnderscore.each(this.options.input, function (inputItem) {
          names.push(inputItem.options.name);
        });
      } else {
        names.push(this.options.input.options.name);
      }
    }

    return oktaUnderscore.uniq(oktaUnderscore.compact(names));
  },
  _getInputElement: function () {
    // NOTE: this.options.input is sometimes not an array under test
    const lastInput = Array.isArray(this.options.input) ? oktaUnderscore.last(this.options.input) : this.options.input; // FIXME: replace with _.get

    const id = lastInput && lastInput.options && lastInput.options.inputId;
    const el = id ? this.$('#' + id) : null;
    return el && el.length ? el : null;
  },
  constructor: function () {
    /* eslint max-statements: [2, 18] */
    BaseView.apply(this, arguments);
    const explainTop = this.options['explain-top'] && this.options['label-top'];

    if (this.options.input) {
      if (oktaUnderscore.isArray(this.options.input)) {
        oktaUnderscore.each(this.options.input, function (inputItem) {
          this.add(inputItem, {
            prepend: !explainTop
          });
        }, this);
      } else {
        this.add(this.options.input, {
          prepend: !explainTop
        });
      }
    }

    this.__setExplain(this.options);

    const names = this._getNames();

    this.listenTo(this.model, 'form:field-error', function (name, errors) {
      if (oktaUnderscore.contains(names, name)) {
        this.__setError(errors, explainTop);
      }
    });
    this.listenTo(this.model, 'form:clear-errors change:' + names.join(' change:'), this.__clearError);
    this.listenTo(this.model, 'form:clear-error:' + names.join(' form:clear-error:'), this.__clearError);

    if (oktaUnderscore.resultCtx(this.options, 'autoRender', this)) {
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
    let explain; // Deprecated - if you need custom html, use explain instead

    if (options.customExplain) {
      Logger.warn('Deprecated - use explain instead of customExplain');
      this.add(this.options.customExplain);
      return;
    }

    explain = options.explain;

    if (oktaUnderscore.isFunction(explain) && !isABaseView(explain)) {
      explain = oktaUnderscore.resultCtx(this.options, 'explain', this);
    }

    if (!explain) {
      return;
    }

    if (isABaseView(explain)) {
      this.template = _Handlebars2.template({
        "compiler": [8, ">= 4.3.0"],
        "main": function (container, depth0, helpers, partials, data) {
          return "<p class=\"o-form-explain\"></p>";
        },
        "useData": true
      });
      this.add(explain, ' > .o-form-explain');
    } else {
      this.template = _Handlebars2.template({
        "compiler": [8, ">= 4.3.0"],
        "main": function (container, depth0, helpers, partials, data) {
          var helper,
              lookupProperty = container.lookupProperty || function (parent, propertyName) {
            if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
              return parent[propertyName];
            }

            return undefined;
          };

          return "<p class=\"o-form-explain\">" + container.escapeExpression((helper = (helper = lookupProperty(helpers, "explain") || (depth0 != null ? lookupProperty(depth0, "explain") : depth0)) != null ? helper : container.hooks.helperMissing, typeof helper === "function" ? helper.call(depth0 != null ? depth0 : container.nullContext || {}, {
            "name": "explain",
            "hash": {},
            "data": data,
            "loc": {
              "start": {
                "line": 1,
                "column": 26
              },
              "end": {
                "line": 1,
                "column": 37
              }
            }
          }) : helper)) + "</p>";
        },
        "useData": true
      });
    }
  },

  /**
   * Highlight the input as invalid (validation failed)
   * Adds an explaination message of the error
   * @private
   */
  __setError: function (errors, explainTop) {
    this.__errorState = true;
    this.$el.addClass('o-form-has-errors');

    const errorId = oktaUnderscore.uniqueId('input-container-error');

    const html = this.__getHTMLForError(oktaUnderscore.flatten(errors), errorId);

    const $elExplain = this.$('.o-form-explain').not('.o-form-input-error').first();

    if ($elExplain.length && !explainTop) {
      $elExplain.before(html);
    } else {
      this.$el.append(html);
    }

    const target = this._getInputElement() || this.$el;
    target.attr('aria-describedby', errorId);
    target.attr('aria-invalid', true);
  },
  __getHTMLForError: function (errors, errorId) {
    const tmpl = _Handlebars2.template({
      "compiler": [8, ">= 4.3.0"],
      "main": function (container, depth0, helpers, partials, data) {
        var helper,
            alias1 = depth0 != null ? depth0 : container.nullContext || {},
            alias2 = container.hooks.helperMissing,
            alias3 = "function",
            alias4 = container.escapeExpression,
            lookupProperty = container.lookupProperty || function (parent, propertyName) {
          if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
            return parent[propertyName];
          }

          return undefined;
        };

        return "<p id=\"" + alias4((helper = (helper = lookupProperty(helpers, "errorId") || (depth0 != null ? lookupProperty(depth0, "errorId") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
          "name": "errorId",
          "hash": {},
          "data": data,
          "loc": {
            "start": {
              "line": 1,
              "column": 7
            },
            "end": {
              "line": 1,
              "column": 18
            }
          }
        }) : helper)) + "\" class=\"okta-form-input-error o-form-input-error o-form-explain\" role=\"alert\"><span class=\"icon icon-16 error-16-small\" role=\"img\" aria-label=\"" + alias4((helper = (helper = lookupProperty(helpers, "iconLabel") || (depth0 != null ? lookupProperty(depth0, "iconLabel") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
          "name": "iconLabel",
          "hash": {},
          "data": data,
          "loc": {
            "start": {
              "line": 1,
              "column": 162
            },
            "end": {
              "line": 1,
              "column": 175
            }
          }
        }) : helper)) + "\"></span>" + alias4((helper = (helper = lookupProperty(helpers, "text") || (depth0 != null ? lookupProperty(depth0, "text") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
          "name": "text",
          "hash": {},
          "data": data,
          "loc": {
            "start": {
              "line": 1,
              "column": 184
            },
            "end": {
              "line": 1,
              "column": 192
            }
          }
        }) : helper)) + "</p>";
      },
      "useData": true
    });

    const iconLabel = StringUtil.localize('oform.error.icon.ariaLabel', 'courage'); // 'Error'

    if (this.options.multirowError) {
      let html = '';
      errors.forEach(error => {
        html = html + tmpl({
          errorId: errorId,
          iconLabel: iconLabel,
          text: error
        });
      });
      return html;
    }

    return tmpl({
      errorId: errorId,
      iconLabel: iconLabel,
      text: errors.join(', ')
    });
  },

  /**
   * Un-highlight the input and remove explaination text
   * @private
   */
  __clearError: function () {
    if (this.__errorState) {
      this.$('.o-form-input-error').remove();
      const target = this._getInputElement() || this.$el;
      target.attr('aria-describedby', null);
      target.attr('aria-invalid', null);
      this.$el.removeClass('o-form-has-errors');
      this.__errorState = false;

      oktaUnderscore.defer(() => {
        this.model.trigger('form:resize');
      });
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

export { InputContainer as default };
