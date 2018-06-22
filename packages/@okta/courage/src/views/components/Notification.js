define([
  'okta/jquery',
  'okta/underscore',
  'shared/views/BaseView'
], function ($, _, BaseView) {

  var defaults = {
    level: 'success',
    message: 'Great Success!',
    hide: true,
    fade: 400,
    delay: 3000,
    width: 0,
    dismissable: false
  };

  return BaseView.extend({

    className: 'infobox infobox-confirm infobox-confirm-fixed',

    events: {
      'click .infobox-dismiss-link': function (e) {
        e.preventDefault();
        this.fadeOut();
      }
    },

    template: '\
      {{#if dismissable}}\
      <a class="infobox-dismiss-link" title="Dismiss" href="#">\
        <span class="dismiss-icon"></span>\
      </a>\
      {{/if}}\
      <span class="icon {{level}}-16"></span>\
      {{#if title}}<h3>{{title}}</h3>{{/if}}\
      <p>{{message}}</p>\
    ',

    initialize: function () {
      this.options = _.defaults({}, this.options, defaults);
      this.$el.addClass('infobox-' + this.options.level);
      if (this.options.width) {
        this.$el.width(this.options.width).css({
          'margin-left': '0px',
          'left': Math.round(($(window).width() - this.options.width) / 2)
        });
      }
    },

    getTemplateData: function () {
      return _.extend(_.pick(this.options, 'level', 'message', 'title'), {
        dismissable: this.options.hide === false || this.options.dismissable === true
      });
    },

    postRender: function () {
      if (this.options.hide) {
        _.delay(_.bind(this.fadeOut, this), this.options.delay);
      }
    },

    fadeOut: function () {
      this.$el.fadeOut(this.options.fade, _.bind(this.remove, this));
    }

  });

});
