define([
  'okta/underscore',
  './Select',
  '../BaseInput'
], function (
  _,
  Select,
  BaseInput
) {

  return Select.extend({
    initialize: function () {
      this.state = this.options.params.state;
      var sharedEnabledOptionsList = this.state.get('select-enabledOptionsList-' + this.options.name);
      if (sharedEnabledOptionsList) {
        this.enabledOptionsList = JSON.parse(JSON.stringify(sharedEnabledOptionsList));
      }
    },

    /**
     * @Override
     */
    editMode: function (update) {
      /* eslint max-statements: [2, 13] */

      this.$el.html(this.template(this.options));
      this.$select = this.$('select');

      this.__populateSelect();

      // Fix a regression in jQuery 1.x on Firefox
      // jQuery.val(value) prepends an empty option to the dropdown
      // if value doesnt exist in the dropdown.
      // http://bugs.jquery.com/ticket/13514
      var value = this.getModelValue();
      if (value) {
        this.$select.val(value);
      }
      else {
        this.$('option:first-child').prop('selected', true);
      }
      this.$el.addClass('o-form-control');

      if (this.params.chosen !== false) {
        this.__applyChosen(update);
      }

      this.__listenToUniqueSelectionEvents();

      return this;
    },

    __populateSelect: function () {
      var options = this.getOptions();

      if (!this.enabledOptionsList) {
        this.__buildEnabledOptionsList(options);
        this.state.set('select-enabledOptionsList-' + this.options.name,
          JSON.parse(JSON.stringify(this.enabledOptionsList)));
      }

      _.each(options, function (value, key) {
        if (this.enabledOptionsList[key] || key === this.model.get(this.options.name)) {
          this.$select.append(this.option({key: key, value: value}));
        }
      }, this);
    },

    __handleOptionSelectedChanged: function (currentSelectedOption, previouslySelectedOption, cid) {
      if (cid !== this.cid) {
        this.enabledOptionsList[previouslySelectedOption] = true;
        this.__disableOptionIfValid(this.enabledOptionsList, currentSelectedOption);
        this.__stopListeningToUniqueSelectionEvents();
        this.editMode(false);
      }
    },

    __handleOptionSelectedRemoved: function (optionToRemove) {
      this.enabledOptionsList[optionToRemove] = true;
      this.__stopListeningToUniqueSelectionEvents();
      this.editMode(false);
    },

    __disableOptionIfValid: function (optionList, key) {
      if (!key || _.isEmpty(key.trim())) {
        return;
      }
      optionList[key] = false;
    },

    __listenToUniqueSelectionEvents: function () {
      this.listenTo(this.state, 'optionSelectedChanged-' + this.options.name, this.__handleOptionSelectedChanged);
      this.listenTo(this.state, 'optionSelectedRemoved-' + this.options.name, this.__handleOptionSelectedRemoved);
    },

    __stopListeningToUniqueSelectionEvents: function () {
      this.stopListening(this.state, 'optionSelectedChanged-' + this.options.name);
      this.stopListening(this.state, 'optionSelectedRemoved-' + this.options.name);
    },

    __buildEnabledOptionsList: function (options) {
      this.enabledOptionsList = {};
      _.each(options, function (value, key) {
        this.enabledOptionsList[key] = true;
      }, this);
    },

    /**
     * @Override
     */
    readMode: function () {
      BaseInput.prototype.readMode.call(this);
      this.__stopListeningToUniqueSelectionEvents();
      return this;
    },

    __processOptionSelectedChanged: function (previouslySelectedOption, currentSelectedOption) {
      var sharedEnabledOptionsList = this.state.get('select-enabledOptionsList-' + this.options.name);
      sharedEnabledOptionsList[previouslySelectedOption || ''] = true;
      this.__disableOptionIfValid(sharedEnabledOptionsList, currentSelectedOption);
      this.state.set('select-enabledOptionsList-' + this.options.name, sharedEnabledOptionsList);
      this.state.trigger('optionSelectedChanged-' + this.options.name,
        currentSelectedOption, previouslySelectedOption, this.cid);
    },

    /**
     * @Override
     */
    update: function () {
      var previouslySelectedOption = this.model.get(this.options.name);
      BaseInput.prototype.update.call(this);
      var currentSelectedOption = this.model.get(this.options.name);

      this.__processOptionSelectedChanged(previouslySelectedOption, currentSelectedOption);
    },

    __processOptionSelectedRemoved: function (optionToRemove) {
      var sharedEnabledOptionsList = this.state.get('select-enabledOptionsList-' + this.options.name);
      sharedEnabledOptionsList[optionToRemove] = true;
      this.state.set('select-enabledOptionsList-' + this.options.name, sharedEnabledOptionsList);
      this.state.trigger('optionSelectedRemoved-' + this.options.name, optionToRemove);
    },

    remove: function () {
      this.__processOptionSelectedRemoved(this.model.get(this.options.name));
      Select.prototype.remove.call(this);
    }
  });
});
