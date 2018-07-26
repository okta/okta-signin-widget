define([
  'okta/jquery',
  'shared/util/TemplateUtil',
  '../BaseInput',
  'shared/util/Keys',
  'vendor/plugins/jquery.placeholder',
  'qtip',
],
function ($, TemplateUtil, BaseInput, Keys) {

  var className = 'okta-form-input-field input-fix';

  function hasTitleAndText(options) {
    var title = options.title,
        text = options.text;

    if (title && text && title !== text) {
      return true;
    }
    return false;
  }

  // options may be a string or an object.
  function createQtipContent(options) {
    if (hasTitleAndText(options)) {
      return options;
    }
    return {text: options.text || options};
  }

  return BaseInput.extend({
    template: TemplateUtil.tpl('\
      {{#if params.innerTooltip}}\
        <span class="input-tooltip icon form-help-16"></span>\
      {{/if}}\
      {{#if params.icon}}\
        <span class="icon input-icon {{params.icon}}"></span>\
      {{/if}}\
      <input type="{{type}}" placeholder="{{placeholder}}" name="{{name}}" id="{{inputId}}"\
       value="{{value}}" aria-label="{{placeholder}}" autocomplete="off"/>\
      {{#if params.iconDivider}}\
        <span class="input-icon-divider"></span>\
      {{/if}}\
      '),
    /**
    * @Override
    */
    events: {
      'input input': 'update',
      'change input': 'update',
      'keydown input': 'update',
      'keyup input': function (e) {
        if (Keys.isEnter(e)) {
          this.model.trigger('form:save');
        }
        else if (Keys.isEsc(e)) {
          this.model.trigger('form:cancel');
        }
      }
    },

    constructor: function () {
      BaseInput.apply(this, arguments);
      this.$el.addClass('o-form-control');
    },

    /**
    * @Override
    */
    editMode: function () {
      this.$el.addClass(className);
      BaseInput.prototype.editMode.apply(this, arguments);
      this.$('input').placeholder();
    },

    /**
    * @Override
    */
    readMode: function () {
      BaseInput.prototype.readMode.apply(this, arguments);
      if (this.options.type == 'password') {
        this.$el.text('********');
      }
      this.$el.removeClass(className);
    },

    /**
    * @Override
    */
    val: function () {
      //IE will only read clear text pw if type="password" is explicitly in selector
      return this.$('input[type="' + this.options.type + '"]').val();
    },

    /**
    * @Override
    */
    focus: function () {
      return this.$('input').focus();
    },

    postRender: function () {
      var params = this.options.params,
          content;

      if (params && params.innerTooltip) {
        content = createQtipContent(params.innerTooltip);
        this.$('.input-tooltip').qtip({
          content: content,
          style: {classes: 'okta-tooltip qtip-custom qtip-shadow'},
          position: {
            my: 'bottom left',
            // Note: qTip2 has a known issue calculating the tooltip offset when:
            // 1. A container element has both:
            //    a) position: relative/absolute
            //    b) overlay: value other than 'visible'
            // 2. The page is scrolled
            //
            // We set position:relative and overlay:auto on the body element,
            // where both are required for:
            // - Positioning the footer correctly
            // - Displaying long pages in embedded browsers
            //
            // The original design called for a fixed position relative to the
            // tooltip icon - this has been switched to "relative to mouse, and
            // update position when mouse moves" because of this constraint.
            target: 'mouse',
            adjust: {
              method: 'flip',
              mouse: true,
              y: -5,
              x: 5
            },
            viewport: $('body')
          }
        });
      }
    }
  });
});
