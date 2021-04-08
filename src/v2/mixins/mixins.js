import { _ } from 'okta';

_.mixin({
  nestedOmit: function(obj, names) {
    var result = _.omit(obj, names);

    if (names.includes(result.name)) {
      result = _.omit(result, 'value');
    }

    _.each(result, function(val, key) {
      if (Array.isArray(val)) {
        result[key] = val.map((v) => {
          return _.nestedOmit(v, names);
        });
      } else if (typeof val === 'object') {
        result[key] = _.nestedOmit(val, names);
      }
    });
    return result;
  },
});

export { _ };
