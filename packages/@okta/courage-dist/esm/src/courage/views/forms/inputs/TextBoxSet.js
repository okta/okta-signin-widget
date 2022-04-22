import _Handlebars2 from '../../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import oktaUnderscore from '../../../util/underscore-wrapper.js';
import SchemaUtils from '../../../util/SchemaUtil.js';
import BaseInput from '../BaseInput.js';
import DeletableBox from './DeletableBox.js';

var TextBoxSet = BaseInput.extend({
  className: 'array-input',
  template: _Handlebars2.template({
    "compiler": [8, ">= 4.3.0"],
    "main": function (container, depth0, helpers, partials, data) {
      var lookupProperty = container.lookupProperty || function (parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }

        return undefined;
      };

      return "<a href=\"#\" class=\"array-inputs-button link-button\">" + container.escapeExpression((lookupProperty(helpers, "i18n") || depth0 && lookupProperty(depth0, "i18n") || container.hooks.helperMissing).call(depth0 != null ? depth0 : container.nullContext || {}, {
        "name": "i18n",
        "hash": {
          "bundle": "courage",
          "code": "oform.add.another"
        },
        "data": data,
        "loc": {
          "start": {
            "line": 1,
            "column": 52
          },
          "end": {
            "line": 1,
            "column": 102
          }
        }
      })) + "</a>";
    },
    "useData": true
  }),
  params: {
    itemType: 'string'
  },
  events: {
    'click .array-inputs-button': function (e) {
      e.preventDefault();

      if (this.isEditMode()) {
        this.addNewElement();
      }
    }
  },
  initialize: function (options) {
    options || (options = {});
    this.params = oktaUnderscore.defaults(options.params || {}, this.params);
    this.uniqueIdPrefix = 'array';
  },
  // api returns null for an array that does not have value
  // convert it to an empty array
  from: function (val) {
    if (!oktaUnderscore.isArray(val)) {
      return [];
    }

    return val;
  },
  // @Override
  editMode: function () {
    this._setArrayObject();

    this.$el.html(this.template);

    oktaUnderscore.each(this.arrayObject, oktaUnderscore.bind(this._addDeletableBox, this));

    return this;
  },
  // @Override
  readMode: function () {
    this.editMode();
    this.$('.array-inputs-button').addClass('link-button-disabled');
  },
  // @Override
  // converts arrayObject to a plain array
  // for string type array, returns all values
  // for number/integer type array, returns values in number type
  val: function () {
    let values = oktaUnderscore.values(this.arrayObject);

    if (oktaUnderscore.contains([SchemaUtils.DATATYPE.number, SchemaUtils.DATATYPE.integer], this.params.itemType)) {
      values = oktaUnderscore.filter(values, oktaUnderscore.isNumber);
    }

    return values;
  },
  focus: function () {},
  addNewElement: function () {
    const value = '';

    const key = oktaUnderscore.uniqueId(this.uniqueIdPrefix);

    this.arrayObject[key] = value;

    this._addDeletableBox(value, key); // update is called to make sure an empty string value is added for string type array


    this.update();
  },
  _addDeletableBox: function (value, key) {
    const deletableBox = new DeletableBox(oktaUnderscore.extend(oktaUnderscore.pick(this.options, 'read', 'readOnly', 'model'), {
      key: key,
      value: value,
      itemType: this.params.itemType
    }));
    this.listenTo(deletableBox, 'updateArray', function (updatedValue) {
      if (oktaUnderscore.isNull(updatedValue)) {
        delete this.arrayObject[key];
        this.stopListening(deletableBox);
      } else {
        this.arrayObject[key] = updatedValue;
      }

      this.update();
    });
    deletableBox.render().$el.hide();
    this.$('.array-inputs-button').before(deletableBox.el);
    deletableBox.$el.slideDown();
    return deletableBox;
  },
  _setArrayObject: function () {
    const array = this.model.get(this.options.name);
    this.arrayObject = {};

    if (oktaUnderscore.isArray(array) && !oktaUnderscore.isEmpty(array)) {
      const keys = [];
      const self = this;

      oktaUnderscore(array.length).times(function () {
        keys.push(oktaUnderscore.uniqueId(self.uniqueIdPrefix));
      });

      this.arrayObject = oktaUnderscore.object(keys, array);
    }
  }
});

export { TextBoxSet as default };
