define(['shared/views/BaseView'],
  function (BaseView) {

    var View = BaseView.extend({

      tagName: 'h2',

      className: 'wizard-head',

      template: '<span class="step-num">{{step}}</span>{{title}}'

    });

    return View;

  });
