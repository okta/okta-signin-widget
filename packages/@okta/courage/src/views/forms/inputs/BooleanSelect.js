define([
  'shared/views/forms/inputs/Select'
], function (Select) {

  var options = {
    'undefined': 'undefined',
    'true': 'true',
    'false': 'false'
  };

  var from = function (val) {
    if (val) {
      return 'true';
    }
    if (val === false) {
      return 'false';
    }
    return 'undefined';
  };

  var to = function (val) {
    switch (val) {
    case 'undefined':
      return null;
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return null;
    }
  };

  return Select.extend({

    initialize: function () {
      this.options.options = options;
      this.options.from = from;
      this.options.to = to;
    }

  });

});
