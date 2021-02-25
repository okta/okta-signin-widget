import { _ } from 'okta';

_.mixin({
  nestedOmit: function (obj, iteratee, context) {
    var result = _.omit(obj, iteratee, context);
          
    _.each(result, function (val, key) {
      if (typeof(val) === 'object') {
        result[key] = _.nestedOmit(val, iteratee, context);
      }
    });
          
    return result;
  }
});

export { _ };
