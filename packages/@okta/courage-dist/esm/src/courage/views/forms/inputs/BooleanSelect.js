import Select from './Select.js';

const options = {
  undefined: 'undefined',
  true: 'true',
  false: 'false'
};

const from = function (val) {
  if (val) {
    return 'true';
  }

  if (val === false) {
    return 'false';
  }

  return 'undefined';
};

const to = function (val) {
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

var BooleanSelect = Select.extend({
  initialize: function () {
    this.options.options = options;
    this.options.from = from;
    this.options.to = to;
  }
});

export { BooleanSelect as default };
