define([
  'okta/underscore',
  'shared/views/forms/BaseInput',
  'shared/util/SchemaUtil',
  './DeletableBox'
], function (_, BaseInput, SchemaUtil, DeletableBox) {

  return BaseInput.extend({
    className: 'array-input',

    template: '<a href="#" class="array-inputs-button link-button">Add Another</a>',

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
      this.params = _.defaults(options.params || {}, this.params);
      this.uniqueIdPrefix = 'array';
    },

    // api returns null for an array that does not have value
    // convert it to an empty array
    from: function (val) {
      if (!_.isArray(val)) {
        return [];
      }
      return val;
    },

    // @Override
    editMode: function () {
      this._setArrayObject();
      this.$el.html(this.template);
      _.each(this.arrayObject, _.bind(this._addDeletableBox, this));

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
      var values = _.values(this.arrayObject);
      if (_.contains([SchemaUtil.DATATYPE.number, SchemaUtil.DATATYPE.integer], this.params.itemType)) {
        values = _.filter(values, _.isNumber);
      }
      return values;
    },

    focus: function () {},

    addNewElement: function () {
      var value = '',
          key = _.uniqueId(this.uniqueIdPrefix);
      this.arrayObject[key] = value;
      this._addDeletableBox(value, key);
      // update is called to make sure an empty string value is added for string type array
      this.update();
    },

    _addDeletableBox: function (value, key) {
      var deletableBox = new DeletableBox(
        _.extend(
          _.pick(this.options, 'read', 'readOnly', 'model'), {key: key, value: value, itemType: this.params.itemType}
        )
      );
      this.listenTo(deletableBox, 'updateArray', function (updatedValue) {
        if (_.isNull(updatedValue)) {
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
      var array = this.model.get(this.options.name);
      this.arrayObject = {};
      if (_.isArray(array) && !_.isEmpty(array)) {
        var keys = [],
            self = this;
        _(array.length).times(function () {
          keys.push(_.uniqueId(self.uniqueIdPrefix));
        });
        this.arrayObject = _.object(keys, array);
      }
    }
  });
});
