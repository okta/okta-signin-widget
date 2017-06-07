define([
  'okta/jquery',
  'okta/underscore',
  'shared/util/Keys',
  'shared/util/TemplateUtil',
  '../BaseInput',
  'vendor/plugins/chosen.jquery'
],
function ($, _, Keys, TemplateUtil, BaseInput) {

  var template = TemplateUtil.tpl('<select id="{{inputId}}" name="{{name}}"></select>');
  var option = TemplateUtil.tpl('<option value="{{key}}">{{value}}</option>');

  // Chosen has known problems when it's at the bottom of a container that has
  // overflow:hidden set. Because it attaches to the parent container, its
  // dropdown will be cut off in the UI. Any modal with a chosen select element
  // at the bottom will manifest this behavior.
  //
  // The fix (aside from replacing Chosen) is to change Chosen's behavior -
  // use the existing styles, but attach it to 'body' and position it correctly
  // so that it is not affected by a parent overflow.
  //
  // More details can be found in OKTA-46489, OKTA-83570
  var CHOSEN_WINDOW_MARGIN = 20;
  var CHOSEN_MAX_HEIGHT = 240;
  var CHOSEN_Z_INDEX = 50000;

  function defer(fn) {
    if (this.params.autoWidth) {
      return fn.call(this);
    }
    else {
      return _.defer(_.bind(fn, this));
    }
  }

  function findSelectWidth(self) {
    self.$select.hide();
    var select = $(self.$select[0]).hide();
    $('body').append(select);
    var width = self.params.width = (select.width() * 1.2) + 'px';
    self.$el.append(select.show());
    return width;
  }

  function recalculateChosen($chosen, $results, $clone) {
    var offset = $clone.offset();
    $chosen.css({
      left: offset.left,
      top: offset.top
    });
    // Update the max-height to fit within the constraints of the window. This
    // is especially important for modals because page scrolling is disabled.
    var $win = $(window),
        rHeight = $results.outerHeight(),
        rBottom = rHeight + $results.offset().top - $win.scrollTop(),
        wHeight = $win.height() - CHOSEN_WINDOW_MARGIN,
        maxHeight = Math.min(rHeight + wHeight - rBottom, CHOSEN_MAX_HEIGHT);
    $results.css('max-height', maxHeight);
  }

  function fixChosenModal($select) {
    var $chosen = $select.next('.chzn-container'),
        $clone = $chosen.clone(),
        $results = $chosen.find('.chzn-results');

    // Use a hidden clone to maintain layout and calculate offset. This is
    // necessary for more complex layouts (like adding a group rule) where
    // the chosen element is floated.
    $clone.css('visibility', 'hidden');
    $clone.removeAttr('id');
    $clone.find('li').removeAttr('id');

    // Save the original styles - we'll revert to them when the select closes
    var baseStyles = {
      'left': $chosen.css('left'),
      'top': $chosen.css('top'),
      'position': $chosen.css('position'),
      'float': $chosen.css('float'),
      'z-index': $chosen.css('z-index')
    };
    $results.hide();

    // Handler for any resize events that happen when the results list is open
    var resizeHandler = _.debounce(function () {
      recalculateChosen($chosen, $results, $clone);
    }, 10);

    // When the dropdown opens, attach it to body, with the correct absolute
    // position coordinates
    $select.on('liszt:showing_dropdown', function () {
      $chosen.width($chosen.width());
      $select.after($clone);
      // .chzn-container can trigger the vertical scrollbar if it causes scrollHeight > window height after append to
      // the body. Force top -999999 to avoid the scrollbar so $chosen can find the right offset for relocation.
      $chosen.css({
        'position': 'absolute',
        'float': 'none',
        'z-index': CHOSEN_Z_INDEX,
        'top': -999999
      });
      $('body').append($chosen);
      $results.show();
      recalculateChosen($chosen, $results, $clone);
      // Capture scroll events:
      // - for forms that use fixed positioning (like editing attributes in
      //   Profile Editor) - window scroll
      // - for forms that are too long for the modal - o-form-content scroll
      $select.parents().scroll(resizeHandler);
      $(window).on('resize scroll', resizeHandler);
    });

    // When the dropdown closes or the element is removed, revert to the
    // original styles and reattach it to its original placement in the dom.
    $select.on('liszt:hiding_dropdown remove', function () {
      $select.parents().off('scroll', resizeHandler);
      $(window).off('resize scroll', resizeHandler);
      $chosen.css(baseStyles);
      $results.hide();
      $results.css('max-height', CHOSEN_MAX_HEIGHT);
      $clone.remove();
      $select.after($chosen);
    });
  }

  return BaseInput.extend({

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

      var options = this.getOptions();
      _.each(options, function (value, key) {
        this.$select.append(option({key: key, value: value}));
      }, this);

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
        this.__applyChosen();
      }
      return this;
    },

    __applyChosen: function () {
      var width = this.options.wide ? '100%' : this.params.width || '62%';
      if (this.params.autoWidth) {
        width = findSelectWidth(this);
      }

      defer.call(this, function () {
        var searchThreshold = this.getParam('searchThreshold', 10);
        if (!_.result(this.options, 'autoRender')) {
          this.update();
        }
        this.$select.chosen({
          'width': width,
          'disable_search_threshold': searchThreshold,
          'placeholder_text': this.options['placeholder']
        });
        fixChosenModal(this.$select);

        if (this.params.autoWidth) { // fix a chosen css bug
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
      var selectedOption = this.getModelValue(),
          displayString = selectedOption,
          options = this.getOptions();
      if (!_.isEmpty(options)) {
        displayString = options[selectedOption];
      }
      if (_.isUndefined(displayString)) {
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
      var options = this.options.options;

      if (_.isFunction(options)) {
        options = options.call(this);
      }

      return _.isObject(options) ? options : {};
    },

    remove: function () {
      if (this.$select) {
        this.$select.trigger('remove');
      }
      return BaseInput.prototype.remove.apply(this, arguments);
    }

  });

});
