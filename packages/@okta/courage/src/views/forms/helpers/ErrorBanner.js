define(['shared/views/BaseView'], function (BaseView) {

  var template = '\
    <div class="okta-form-infobox-error infobox infobox-error" role="alert">\
      <span class="icon error-16"></span>\
      {{#if errorSummary}}\
        <p>{{errorSummary}}</p>\
      {{else}}\
        <p>{{i18n code="oform.errorbanner.title" bundle="login"}}</p>\
      {{/if}}\
    </div>\
  ';

  return BaseView.extend({
    template: template,
    modelEvents: {
      'form:clear-errors': 'remove'
    }
  });
});
