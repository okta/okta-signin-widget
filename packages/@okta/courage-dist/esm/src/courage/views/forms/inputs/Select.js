import _Handlebars2 from '../../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import oktaJQueryStatic from '../../../util/jquery-wrapper.js';
import oktaUnderscore from '../../../util/underscore-wrapper.js';
import Keys from '../../../util/Keys.js';
import '../../../vendor/plugins/chosen.jquery.js';
import BaseInput from '../BaseInput.js';

const template = _Handlebars2.template({
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

    return "<select id=\"" + alias4((helper = (helper = lookupProperty(helpers, "inputId") || (depth0 != null ? lookupProperty(depth0, "inputId") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
      "name": "inputId",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 12
        },
        "end": {
          "line": 1,
          "column": 23
        }
      }
    }) : helper)) + "\" name=\"" + alias4((helper = (helper = lookupProperty(helpers, "name") || (depth0 != null ? lookupProperty(depth0, "name") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
      "name": "name",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 31
        },
        "end": {
          "line": 1,
          "column": 39
        }
      }
    }) : helper)) + "\"></select>";
  },
  "useData": true
});

const option = _Handlebars2.template({
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

    return "<option value=\"" + alias4((helper = (helper = lookupProperty(helpers, "key") || (depth0 != null ? lookupProperty(depth0, "key") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
      "name": "key",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 15
        },
        "end": {
          "line": 1,
          "column": 22
        }
      }
    }) : helper)) + "\">" + alias4((helper = (helper = lookupProperty(helpers, "value") || (depth0 != null ? lookupProperty(depth0, "value") : depth0)) != null ? helper : alias2, typeof helper === alias3 ? helper.call(alias1, {
      "name": "value",
      "hash": {},
      "data": data,
      "loc": {
        "start": {
          "line": 1,
          "column": 24
        },
        "end": {
          "line": 1,
          "column": 33
        }
      }
    }) : helper)) + "</option>";
  },
  "useData": true
});

const CHOSEN_WINDOW_MARGIN = 20; // Chosen has known problems when it's at the bottom of a container that has
// overflow:hidden set. Because it attaches to the parent container, its
// dropdown will be cut off in the UI. Any modal with a chosen select element
// at the bottom will manifest this behavior.
//
// The fix (aside from replacing Chosen) is to change Chosen's behavior -
// use the existing styles, but attach it to 'body' and position it correctly
// so that it is not affected by a parent overflow.
//
// More details can be found in OKTA-46489, OKTA-83570

const CHOSEN_MAX_HEIGHT = 240;
const CHOSEN_Z_INDEX = 50000;

function defer(fn) {
  if (this.params.autoWidth) {
    return fn.call(this);
  } else {
    return oktaUnderscore.defer(oktaUnderscore.bind(fn, this));
  }
}

function findSelectWidth(self) {
  self.$select.hide();
  const select = oktaJQueryStatic(self.$select[0]).hide();
  oktaJQueryStatic('body').append(select);
  const width = self.params.width = select.width() * 1.2 + 'px';
  self.$el.append(select.show());
  return width;
}

function recalculateChosen($chosen, $results, $clone) {
  const offset = $clone.offset();
  $chosen.css({
    left: offset.left,
    top: offset.top
  }); // Update the max-height to fit within the constraints of the window. This
  // is especially important for modals because page scrolling is disabled.

  const $win = oktaJQueryStatic(window);
  const rHeight = $results.outerHeight();
  const rBottom = rHeight + $results.offset().top - $win.scrollTop();
  const wHeight = $win.height() - CHOSEN_WINDOW_MARGIN;
  const maxHeight = Math.min(rHeight + wHeight - rBottom, CHOSEN_MAX_HEIGHT);
  $results.css('max-height', maxHeight);
} // eslint-disable-next-line max-statements


function fixChosenModal($select, textPlaceholder) {
  const $chosen = $select.next('.chzn-container');
  const $clone = $chosen.clone();
  const $results = $chosen.find('.chzn-results');
  const $searchInput = $chosen.find('.chzn-search input[type=text]');
  $searchInput.on('keyup', () => {
    $chosen.find('#' + $select.attr('id') + '_txt').attr('aria-activedescendant', $results.find('.active-result.highlighted').attr('id'));
    const noResult = $results.find('li.no-results');

    if (noResult.length) {
      noResult.attr('role', 'alert');
    }
  });
  $chosen.addClass('closed'); // Will be used in SIW to fix screen reader focus.
  // Use a hidden clone to maintain layout and calculate offset. This is
  // necessary for more complex layouts (like adding a group rule) where
  // the chosen element is floated.

  $clone.css('visibility', 'hidden');
  $clone.removeAttr('id');
  $clone.find('li').removeAttr('id'); // Save the original styles - we'll revert to them when the select closes

  const baseStyles = {
    left: $chosen.css('left'),
    top: $chosen.css('top'),
    position: $chosen.css('position'),
    float: $chosen.css('float'),
    'z-index': $chosen.css('z-index')
  };
  $results.hide(); // Handler for any resize events that happen when the results list is open

  const resizeHandler = oktaUnderscore.debounce(function () {
    recalculateChosen($chosen, $results, $clone);
  }, 10); // When the dropdown opens, attach it to body, with the correct absolute
  // position coordinates


  $select.off('.fixChosen'); // Remove events we could have added before

  $select.on('liszt:showing_dropdown.fixChosen', function () {
    $chosen.width($chosen.width());
    $select.after($clone); // .chzn-container can trigger the vertical scrollbar if it causes scrollHeight > window height after append to
    // the body. Force top -999999 to avoid the scrollbar so $chosen can find the right offset for relocation.

    $chosen.css({
      position: 'absolute',
      float: 'none',
      'z-index': CHOSEN_Z_INDEX,
      top: -999999
    });
    oktaJQueryStatic('body').append($chosen);
    oktaJQueryStatic('.chzn-search > :text').prop('placeholder', textPlaceholder);
    $results.show();
    recalculateChosen($chosen, $results, $clone); // Capture scroll events:
    // - for forms that use fixed positioning (like editing attributes in
    //   Profile Editor) - window scroll
    // - for forms that are too long for the modal - o-form-content scroll

    $select.parents().scroll(resizeHandler);
    oktaJQueryStatic(window).on('resize scroll', resizeHandler);
  });
  $select.on('liszt:showing_dropdown', function () {
    $chosen.removeClass('closed');
  }); // When the dropdown closes or the element is removed, revert to the
  // original styles and reattach it to its original placement in the dom.

  $select.on('liszt:hiding_dropdown.fixChosen remove.fixChosen', function () {
    $select.parents().off('scroll', resizeHandler);
    oktaJQueryStatic(window).off('resize scroll', resizeHandler);
    $chosen.css(baseStyles);
    $results.hide();
    $chosen.addClass('closed');
    $results.css('max-height', CHOSEN_MAX_HEIGHT);
    $clone.remove();
    $select.after($chosen);
  }); // Do not change the order of event listeners. This event must execute after 
  // "liszt:hiding_dropdown.fixChosen remove.fixChosen"

  $select.on('liszt:hiding_dropdown.fixChosen', function () {
    $searchInput.focus(); // set focus back to input only when the dropdown is closed
  });
}

var Select = BaseInput.extend({
  className: 'o-form-select',

  /**
   * @Override
   */
  events: {
    'change select': 'update',
    'keyup .chzn-search > :text': function (e) {
      if (Keys.isEsc(e)) {
        this.$('.chzn-search > :text').val('');
        e.stopPropagation();
      }
    }
  },
  constructor: function () {
    this.template = template;
    this.option = this.option || option;
    BaseInput.apply(this, arguments);
    this.params = this.options.params || {};
  },

  /**
   * @Override
   */
  editMode: function () {
    /* eslint max-statements: [2, 13] */
    this.$el.html(template(this.options));
    this.$select = this.$('select');
    const options = this.getOptions();

    oktaUnderscore.each(options, function (value, key) {
      this.$select.append(this.option({
        key: key,
        value: value
      }));
    }, this); // Fix a regression in jQuery 1.x on Firefox
    // jQuery.val(value) prepends an empty option to the dropdown
    // if value doesnt exist in the dropdown.
    // http://bugs.jquery.com/ticket/13514


    const value = this.getModelValue();

    if (value) {
      this.$select.val(value);
    } else {
      this.$('option:first-child').prop('selected', true);
    }

    this.$el.addClass('o-form-control');

    if (this.params.chosen !== false) {
      this.__applyChosen();
    }

    return this;
  },
  __applyChosen: function (update) {
    let width = this.options.wide ? '100%' : this.params.width || '62%';

    if (this.params.autoWidth) {
      width = findSelectWidth(this);
    }

    defer.call(this, function () {
      const searchThreshold = this.getParam('searchThreshold', 10);

      if (!oktaUnderscore.result(this.options, 'autoRender') && update !== false) {
        this.update();
      }

      this.$select.chosen({
        width: width,
        disable_search_threshold: searchThreshold,
        //eslint-disable-line camelcase
        placeholder_text: this.options['placeholder'],
        //eslint-disable-line camelcase
        search_contains: true //eslint-disable-line camelcase

      }); //if options are more than search threshold, consider it as a combobox

      const isComboBox = this.options & this.options.options && Object.keys(this.options.options).length > searchThreshold ? true : false;
      this.accessibilityUpdate(isComboBox, this.params);
      fixChosenModal(this.$select, this.searchPlaceholder);

      if (this.params.autoWidth) {
        // fix a chosen css bug
        this.$el.width(0);
      }

      this.model.trigger('form:resize');
    });
  },

  /**
   * @Override
   */
  val: function () {
    return this.$select && this.$select.val();
  },

  /**
   * @Override
   */
  focus: function () {
    if (this.$select) {
      return this.$select.focus();
    }
  },

  /**
   * @Override
   */
  toStringValue: function () {
    const selectedOption = this.getModelValue();
    let displayString = selectedOption;
    const options = this.getOptions();

    if (!oktaUnderscore.isEmpty(options)) {
      displayString = options[selectedOption];
    }

    if (oktaUnderscore.isUndefined(displayString)) {
      displayString = this.defaultValue();
    }

    return displayString || '';
  },

  /**
   * Convert options to an object
   * support input options that is a
   * 1. a static object such as {key1: val1, key2: val2...}
   * 2. a function to be called to return a static object
   * will return an object with key-value pairs or with empty content
   * @return {Object} The value
   */
  getOptions: function () {
    let options = this.options.options;

    if (oktaUnderscore.isFunction(options)) {
      options = options.call(this);
    }

    return oktaUnderscore.isObject(options) ? options : {};
  },
  remove: function () {
    if (this.$select) {
      this.$select.trigger('remove');
    }

    return BaseInput.prototype.remove.apply(this, arguments);
  },

  /**
   * Code to make the select/combobox component accessible with screen readers.
   *
   * @param {boolean} isComboBox - Is the select a combobox?
   * @param {object} params - params like aria label
   */
  accessibilityUpdate: function (isComboBox, params) {
    const txtBoxId = this.$select.attr('id') + '_txt';

    if (isComboBox) {
      this.$('input[type=text]').attr('id', txtBoxId).attr('role', 'combobox').attr('aria-autocomplete', 'list');
    } else {
      this.$('input[type=text]').attr('id', txtBoxId).attr('role', 'listbox');
    }

    if (params && params.aria && params.aria.label) {
      this.$('input[type=text]').attr('id', txtBoxId).attr('aria-label', params.aria.label);
    } else {
      this.$('input[type=text]').attr('id', txtBoxId).attr('aria-label', this.$el.parent().prev('.o-form-label').find('label').text());
    }

    this.$('.chzn-results .active-result').attr('role', 'option');
  }
});

export { Select as default };
