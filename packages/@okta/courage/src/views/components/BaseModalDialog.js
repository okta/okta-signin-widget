define([
  'okta/jquery',
  'okta/underscore',
  'shared/util/TemplateUtil',
  'shared/views/BaseView',
  'vendor/plugins/jquery.simplemodal'
],
function ($, _, TemplateUtil, BaseView) {

  var tpl = TemplateUtil.tpl;

  /**
  * @class Okta.ModalDialog
  *
  * A view that renders as a modal dialog.
  * The template of the view will render inside a dialog.
  *
  * It uses [SimpleModal](http://www.ericmmartin.com/projects/simplemodal) as the base modal widget.
  *
  * In the context of a {@link Okta.View}, do not `add` this view to the container - simply call render
  * A modal dialog is a special view in terms of - it has an overlay and takes over the screen, so conceptually
  * it is not a part of any other view.
  *
  * @extends Okta.View
  *
  */

  return BaseView.extend({

    /**
     * @property {Object} [params] parameters to pass to the simplemodal plugin
     *
     * See [Available Options](http://www.ericmmartin.com/projects/simplemodal/#options)
     */
    params: {},

    constructor: function () {
      BaseView.apply(this, arguments);
      this.$el.addClass('simplemodal-wrap');

      // garbage collection - remove the view when modal is closed
      this.params = _.extend({
        onClose: _.bind(_.throttle(this.remove, 64), this)
      }, this.params || {});
    },

    render: function () {
      /* eslint max-statements: [2, 16] */

      this.delegateEvents(); // modal may be rendered multiple times
      BaseView.prototype.render.apply(this, arguments);

      var options = _.extend({}, _.pick(this, 'title', 'subtitle'), _.pick(this.options, 'title', 'subtitle'));

      if (options.subtitle) {
        var subtitle = _.resultCtx(options, 'subtitle', this);
        this.$el.prepend(tpl('<p class="modal-subtitle text-light \
          padding-20 margin-btm-0">{{subtitle}}</p>')({subtitle: subtitle}));
      }

      if (options.title) {
        var title = _.resultCtx(options, 'title', this);
        this.$el.prepend(tpl('<h2 class="block modal-title">{{title}}</h2>')({title: title}));
      }

      // running deferred fixes a rendering issue with simplemodal
      _.defer(_.bind(function () {
        this.$el.modal(this.params);
        this.resize();
      }, this));

      // make sure scrolling on the body is disabled;
      $('body').css('overflow', 'hidden');

      return this;
    },

    remove: function () {
      $.modal.close();
      // re-enable document scroll; blank property value removes property altogether
      $('body').css('overflow', '');
      _.defer(function () {
        $.modal.close();
      });
      return BaseView.prototype.remove.apply(this, arguments);
    },

    /**
     * Adjusts the modal content size based on the current content
     */
    resize: function () {
      $.modal.update(this.$el.outerHeight());
    }

  });

});
