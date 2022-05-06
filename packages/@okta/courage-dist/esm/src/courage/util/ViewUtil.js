import oktaUnderscore from './underscore-wrapper.js';

function changeEventString(doWhen) {
  return 'change:' + oktaUnderscore.keys(doWhen).join(' change:');
}

function calcDoWhen(value, key) {
  const modelValue = this.model.get(key);

  if (oktaUnderscore.isFunction(value)) {
    return value.call(this, modelValue);
  } else {
    return value === modelValue;
  }
}

function _doWhen(view, doWhen, fn) {
  const toggle = oktaUnderscore.bind(fn, view, view, doWhen);

  view.render = oktaUnderscore.wrap(view.render, function (render) {
    const val = render.call(view);
    toggle({
      animate: false
    });
    return val;
  });
  view.listenTo(view.model, changeEventString(doWhen), function () {
    toggle({
      animate: true
    });
  });
}

var ViewUtil = {
  applyDoWhen: function (view, doWhen, fn) {
    if (!(view.model && oktaUnderscore.isObject(doWhen) && oktaUnderscore.size(doWhen) && oktaUnderscore.isFunction(fn))) {
      return;
    }

    _doWhen(view, doWhen, function (view, doWhen, options) {
      const result = oktaUnderscore.every(oktaUnderscore.map(doWhen, calcDoWhen, view));

      fn.call(view, result, options);
    });
  }
};

export { ViewUtil as default };
