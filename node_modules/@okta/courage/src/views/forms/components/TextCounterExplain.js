define([
  'okta/underscore',
  'shared/views/BaseView'
], function (_, BaseView) {

  return BaseView.extend({

    template: '\
    {{#if hasRemaining}}\
      {{i18n code="characters.remaining" bundle="messages" arguments="count"}}\
    {{/if}}\
    {{#unless hasRemaining}}\
      <div class="o-form-text-counter-over">\
        {{i18n code="characters.over" bundle="messages" arguments="count"}}\
      </div>\
    {{/unless}}',

    modelEvents: function () {
      var events = {};
      events['change:' + this.options.field] = _.throttle(this.render, 50);

      return events;
    },

    /**
     *
     * @param {Okta.Model} options.model an Model
     * @param {String} options.field the model field to track the count against.
     *                               it shall have defined "maxLength".
     *
     */
    initialize: function () {
      if (!this.options.model ||
          !this.options.field) {
        throw new Error('Cannot create TextCounterExplain. missing arguments ["model", "field"]');
      }

      var propertySchema = this.options.model.getPropertySchema(this.options.field);

      if (!propertySchema || !_.isNumber(propertySchema.maxLength)) {
        throw new Error('Cannot create TextCounterExplain. property missing "maxLength" definition');
      }

      this.field = this.options.field;
      this.maxLength = propertySchema.maxLength;
    },

    getTemplateData: function () {
      var value = this.model.get(this.field) || '',
          max = this.maxLength,
          remains = max - value.length,
          hasRemaining = remains >= 0;

      return { hasRemaining: hasRemaining,
        count: hasRemaining ? remains : Math.abs(remains)
      };
    }

  });
});
