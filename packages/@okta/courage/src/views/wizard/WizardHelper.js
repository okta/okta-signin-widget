define([
  'okta/underscore',
  'shared/views/BaseView'
],
function (_, BaseView) {

  function addIf(view, attr, selector) {
    var child = view[attr];
    if (child) {
      if (_.isFunction(child) && !(child.prototype instanceof BaseView)) {
        child = child.call(view);
        if (_.isString(child)) {
          /* eslint max-depth: 0 */
          child = _.escape(child);
        }
      }
      else if (_.isString(child)) {
        child = _.escape(child);
      }
      return view.add(child, selector);
    }
  }

  return {
    addIf: addIf
  };

});
