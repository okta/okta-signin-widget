define([
  'okta/underscore',
  'okta/jquery',
  './BaseModalDialog',
  'shared/util/Fx',
  'shared/views/components/DialogLoading'
],
function (_, $, BaseModalDialog, Fx, DialogLoading) {

  /**
   * The Stage Singleton
   *
   * The only way to get the height of an element is to render it to the DOM
   * changing the height after rendering will then cause a flicker.
   * To avoid this, an invisible DOM element is created for measuring height.
   * @private
   */
  var Stage = (function Stage() {
    var stage,
        template =
        '<div class="modal-staging simplemodal-wrap" ' +
        'style="visibility: hidden; position: absolute;">' +
        '</div>';

    /**
     * Calculates the height of the content around the selector
     * and then subtracts this from the max height allowed.
     * This is ideal for determining what size the content
     * could be set to and still fit inside the container
     * This method assumes the content is already rendered
     * If not rendered, it will set container height as 0 and return maxHeight
     *
     * @param {HTMLElement} container - jquery element
     * @param {String} selector - jquery selector
     * @param {Number} maxHeight - the height in pixel available to the container
     * returns {Number} the remaining height available to the selector
     */
    function availableHeight(container, selector, maxHeight) {
      var el = $(container).find(selector),
          buffer, fixedHeight;

      if (!el) { return; }

      buffer = el.outerHeight(true) - el.height();
      fixedHeight = sumHeights(el.siblings()) + buffer;

      return maxHeight - fixedHeight;
    }

    function createStage() {
      $('body').append(template);
      return $('.modal-staging');
    }

    function sumHeights(siblings) {
      return _.reduce(siblings, function (memo, el) {
        return memo + $(el).outerHeight(true);
      }, 0);
    }

    function set(html, action) {
      if (!stage) {
        stage = createStage();
      }
      stage.html(html);
      var result = action(stage);
      stage.empty();
      return result;
    }

    return {

      measure: function (html) {
        return set(html, function (stage) {
          return stage.height();
        });
      },

      fit: function (html, selector, maxHeight) {
        return set(html, function (stage) {
          return availableHeight(stage, selector, maxHeight);
        });
      },

      remove: function () {
        if (stage) { stage.remove(); }
        stage = undefined;
      }
    };
  })();

  // jquery.simplemodal options (can be overridden via 'params')
  var SIMPLE_MODAL_PARAMS = {
    minWidth: 600,
    maxWidth: 950,
    autoResize: false, // (use the resizeModal method, so that the scrolling goes to content, not the whole modal)
    autoPosition: true
  };

  return BaseModalDialog.extend({
    /**
     * @property {Number} [height] The height in pixels for the modal. If none specified
     * the height will be set to equal the view's height.
     */

    /**
     * @property {Boolean} [resizeOnSwitch] Config to specify if the modal dialog has to be resized
     * when switching to a new view.
     */
    resizeOnSwitch: false,

    /**
     * @class Okta.MultiViewModalDialog
     * A modal view that transitions other views into itself.
     *
     * @param {Object} options Options Hash
     *
     */
    constructor: function (options) {
      _.defaults(this.params, SIMPLE_MODAL_PARAMS);

      BaseModalDialog.apply(this, arguments);

      options || (options = {});
      _.extend(this, _.pick(options, 'View', 'height', 'resizeOnSwitch'));

      if (!this.View) {
        throw new Error('The MultiViewModalDialog must be provided a View when initialized');
      }

      this._prefetchDetection(options, false);

      this.Stage = Stage; //exposed for testing purposes only
    },

    render: function () {
      BaseModalDialog.prototype.render.apply(this, arguments);
      // BaseModalDialog adds the view's content to a modal in a deferred step
      // By setting the view's content height after render, it will execute
      // before the deferred function that adds the view to the modal
      // This prevents a visual blip when resizing after being displayed.

      // Set the height of the modal and the content inside (stretch the content or add scroll bars accordingly).
      this._setHeight();
      this._setContentHeight();

      return this;
    },

    remove: function () {
      Stage.remove();
      BaseModalDialog.prototype.remove.apply(this, arguments);
    },

    /**
     * Switch from the current view to a new view.
     *
     * @param {Okta.View} newView - the new view to add to the modal dialog.
     * @param {Object} options (optional)
     * @param {String|Function} options.title - title for the modal dialog.
     * @param {Number} options.height - height for the modal dialog.
     * @param {String} options.transition - the transition to apply to the new view (supported by Fx.EFFECTS).
     */
    switchView: function (newView, options) {
      options || (options = {});

      // It is used to recover the height when error occurs
      options = _.clone(_.extend(options, {currentViewHeight: this.height}));
      _.extend(this, _.pick(options, 'height'), {View: newView});

      this._prefetchDetection(options, true);
    },

    /**
     * Update the title of the modal based on the title of the child view.
     * Background - The child views may be created as a re-usable component in hopes of re-using them in a
     * normal layout as well as a modal dialog. If they are used in a modal, we don't want the title to be
     * in the child view anymore. Instead, it makes sense to push this title to the modal dialog and remove
     * the child view's title. This method does that.
     * Note - There could be a case in the future where is this not desired. We should add a config into
     * the modal to prevent this.
     *
     * @param {String|Function} title - Title for the modal.
     */
    updateTitle: function (title) {
      title = title || this.currentView.title;
      if (title) {
        if (_.isFunction(title)) {
          title = title.call(this);
        }

        if (this.rendered()) {
          // The modal is already rendered. Change the text in the title element
          // and remove the child view's title element.
          this.$('h2.block').html(title);
          this.currentView.$('h2.okta-form-title').remove();
        } else {
          // The modal hasn't rendered yet. Just change the title properties.
          this.title = title;
          this.currentView.title = '';
        }
      }
    },

    /**
     * Add the child view to the modal and attach the event listeners on it.
     *
     * @param {Object} options - options hash
     * @param {String} [options.title] - title for the modal.
     * @private
     */
    _addView: function (newView, options) {
      if (this.currentView) {
        this.currentView.remove();
      }

      this.currentView = this.add(newView).at(0);
      this.resizeSelector = this.currentView.resizeSelector || this.currentView.el;

      this.updateTitle(options.title);

      // Listener for the resize event on the child view of the modal.
      this.listenTo(this.currentView, 'resize', _.debounce(_.bind(this._setContentHeight, this), 100));
    },

    /**
     * Add 'overflow:auto' inline style to the specified element. Style is set inline to ensure
     * highest specificity.
     *
     * @param {HTMLElement} el - jquery element
     * @param {Number} height - height to set to the element
     * @private
     */
    _addScrollbars: function (el, height) {
      el.height(height);
      el.css('overflow', 'auto');
    },

    /**
     * Get the maximum allowed height for the modal.
     * Modal height may not exceed 90% of viewport
     *
     * @returns {Number} height.
     * @private
     */
    _getMaxHeight: function () {
      return Math.round(0.9 * $(window).height());
    },

    /**
     * Set the max-height for a view within the modal
     * This is done by calculating the height of the view in a hidden div
     * then calculating the fixed height, every element except the resizableSelector.
     * The the difference between the max height and the fixed height is the
     * resizableSelector's height.
     * @private
     */
    _setContentHeight: function () {
      var view = this.currentView,
          scrollingArea = view.$(this.resizeSelector),
          scrollHeight = Stage.fit(view.$el.html(), this.resizeSelector, this.height);

      if (scrollingArea.height() === scrollHeight) {
        return; // the correct size is already set
      }

      if (scrollHeight) {
        this._addScrollbars(scrollingArea, scrollHeight);
        this.resize();
      }
    },

    /**
     * Set height to the best option:
     * 1. use height if it is not too small or too large
     * 2. use currentHeight if height is undefined
     * 3. use maxHeight if option 1 and 2 are too large
     *
     * @param {Boolean} auto - auto-calculate the height instead of using this.height.
     * @private
     */
    _setHeight: function (auto) {
      var max = this._getMaxHeight(),
          fixed = auto ? undefined : this.height,
          current, available;

      // IF fixed height is too large use max
      if (fixed > max) {
        this.height = max;
        return;
      }

      // IF fixed height is not too small, use it.
      available = Stage.fit(this.$el.html(),
          this.currentView.resizeSelector, fixed);

      // the scrolling area must be more than 20 px
      if (available > 20) {
        return;
      }

      // no valid fixed height, so check current height
      current = Stage.measure(this.$el.html());
      this.height = Math.min(current, max);
    },

    /**
     * Implement switch from the current view to a new view.
     *
     * @param {Object} options - options hash
     * @param {Object} An instantiated view object
     * @param {Boolean} Indicator of a call from constructor or switch view
     * @private
     */
    _onPrefetchSuccess: function (newView, options, isSwitchView) {
      /* eslint max-statements: [2, 11] */
      var animationNeeded = (this.currentView) ? true : false;

      this._spinnerHide();
      this._addView(newView, options);

      // Return if this is a call during construction and no prefetch required
      if (!isSwitchView && !animationNeeded) {
        return false;
      }

      // If this is a call during initialization and prefetch required
      if (!isSwitchView && animationNeeded) {
        this._resizeDialog({
          height: options.height,
          transition: Fx.EFFECTS.NONE
        });
      } else {
        this._resizeDialog(options);
      }

      // If postfetch function is overwritten by switch view option
      if (_.isFunction(options.postfetch)) {
        _.defer(options.postfetch);
      // If postfetch function is defined in view
      } else if (_.isFunction(newView.postfetch)) {
        _.defer(_.bind(newView.postfetch, newView));
      }
    },

    /**
     * Resize the Dialog once the setup is ready
     *
     * @param options
     * @private
     */
    _resizeDialog: function (options) {
      /*
       * Update the height of the modal and the content within it. If the height is passed in the options,
       * it becomes the new height of the modal (we still call _setHeight() to ensure that the passed-in
       * height doesn't exceed the max height). If the height is not passed and if the auto-resize is enabled,
       * the height is re-calculated and applied to the modal. And finally, set the content's height
       * (stretch/adjust child view's content for scroll bars).
       */
      if (options.height) {
        this._setHeight();
      } else if (this.resizeOnSwitch) {
        this._setHeight(true);
      }
      this._setContentHeight();

      // Animate the new view. Default is 'slide'.
      Fx.animate(this.currentView.$el, options.transition || Fx.EFFECTS.SLIDE);
    },

    /**
     * Get an instance of the View
     *
     * @param {Object|Function} A view which can be either a function or instance
     * @returns {Object} instance of View.
     * @private
     */
    _getInstantiatedView: function (View) {
      return (_.isFunction(View)) ? new View(this.options) : View;
    },

    /**
     * Show when prefetch error
     * @private
     */
    _prefetchError: function (options) {
      /*
       * The height of the form can be reset when error occurs, that's why we need to set the
       * height of the current view again.
       */
      this.height = options.currentViewHeight || this.height;
      this._setHeight();
      this._setContentHeight();
      this._spinnerHide();
    },

    /**
     * Show the in view spinner
     *
     * @param {Object} An instantiated view object
     * @private
     */
    _spinnerShow: function (newView) {
      if (this.currentView) {
        this.spinnerView = new DialogLoading({elToAttachTo: this.currentView.$(this.resizeSelector)});
        this.add(this.spinnerView);
      } else {
        // Insert a loading view and it is removed once the prefetch is ready.
        this._addView(new DialogLoading({height: this.height}), {title: newView.title});
      }
    },

    /**
     * Hide the in view spinner
     *
     * @private
     */
    _spinnerHide: function () {
      if (this.spinnerView) {
        this.spinnerView.remove();
      }
    },

    /**
     * Get the prefetch from from view
     *
     * @param {Object} An instantiated view object
     * @param {Object} options
     * @returns {Function|Boolean} - Return a prefetch function if exists otherwise false
     * @private
     */
    _getPrefetchFunction: function (newView, options) {
      var prefetch = _.isUndefined(options.prefetch) ? newView.prefetch : options.prefetch;

      // Do not prefetch if it is turned off
      if (!prefetch) {
        return false;
      }

      // If prefetch function is overwritten by switch view option
      if (_.isFunction(options.prefetch)) {
        return options.prefetch;
      // If prefetch function is defined in view
      } else if (_.isFunction(newView.prefetch)) {
        return _.bind(newView.prefetch, newView);
      }

      // If either or both prefetch is set to true, return model
      return _.bind(newView.model.fetch, newView.model);
    },

    /**
     * Detect if prefetch requires
     *
     * @param {Object} options
     * @param {Boolean} Indicator of a call from constructor or switch view
     * @private
     */
    _prefetchDetection: function (options, isSwitchView) {
      var self = this,
          newView = this._getInstantiatedView(this.View),
          callback = _.bind(this._onPrefetchSuccess, this, newView, options, isSwitchView),
          prefetchFunction = this._getPrefetchFunction(newView, options);

      if (prefetchFunction) {
        this._spinnerShow(newView);

        $.when(
          prefetchFunction()
        )
        .done(callback)
        .fail(function () {
          self._prefetchError(options);
        });

      } else {
        callback();
      }
    }

  });
});
