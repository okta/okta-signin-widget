define(['shared/views/BaseView'],
  function (BaseView) {

    var View = BaseView.extend({

      tagName: 'h2',

      className: 'okta-form-title o-form-head',

      template: '{{title}}'

    });

    return View;

  });
