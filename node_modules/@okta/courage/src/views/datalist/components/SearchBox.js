/* eslint max-statements: [2, 11] */
define(['okta/underscore',
  'shared/util/Time',
  'shared/util/Keys',
  'shared/views/BaseView',
  'vendor/plugins/jquery.placeholder'
], function (_, Time, Keys, BaseView) {

  var View = BaseView.extend({

    template: '\
    <span class="search-box input-fix">\
      <span class="icon-only icon-16 magnifying-glass-16"></span>\
      <input class="text-field-default" type="text" placeholder="{{placeholder}}">\
      <a href="#" class="link-button allow-in-read-only clear-search icon-16" style="display: none;">\
          <span class="icon clear-input-16"></span>\
      </a>\
    </span>\
  ',

    events: {
      'input .text-field-default': 'update',
      'click .clear-search': 'reset',
      'keyup .text-field-default': function (e) {
        e.preventDefault();
        if (e.which === Keys.ESC) {
          this.reset();
        } else {
          this.update();
        }

      }
    },

    /**
    * Options:
    * - float: where to float - 'right' or 'left' - defaults to left
    * - field: name of the field to bind to on the state model - defaults to 'search'
    */

    constructor: function () {
      BaseView.apply(this, arguments);

      if (!this.state) {
        throw new Error('No State Provided');
      }

      this.options.minChars || (this.options.minChars = 2);
      this.options.placeholder || (this.options.placeholder = 'Search...');

      this.$el.addClass('search-box-wrap');
      this.$el.addClass(this.options['float'] === 'right' ? 'float-r' : 'float-l');

      this.field = this.options.field || 'search';

      this.listenTo(this.state, 'change:' + this.field, this._updateValue);

      // debounce to make sure we don't trigger too many change events
      this._updateState = _.debounce(this._updateState, Time.DEBOUNCE_DELAY);
      _.bindAll(this, '_updateState', 'update');
    },

    render: function () {
      BaseView.prototype.render.apply(this);
      this._updateValue();

      return this;
    },

    update: function () {
      this.$('.clear-search').toggle(!!this.val());
      this._updateState();
    },

    remove: function () {
      this.$('input').off(); // clean up oldIE event listener
      BaseView.prototype.remove.apply(this, arguments);
    },

    reset: function (e) {
      e && e.preventDefault();
      this.val('');
      this.update();
    },

    val: function () {
      var $input = this.$('input');
      return $input.val.apply($input, arguments);
    },

    _stateValue: function () {
      return this.state.get(this.field) || '';
    },

    _updateState: function () {
      this._changed() && this.state.set(this.field, this.val());
    },

    _updateValue: function () {
      this._changed() && this.val(this._stateValue()) && this.$('.clear-search').toggle(!!this.val());
    },

    _changed: function () {
      var val = this.val() || '',
          length = val.length;
      return (length === 0 || length >= this.options.minChars) && this._stateValue() != val;
    }

  });

  return View;

});
