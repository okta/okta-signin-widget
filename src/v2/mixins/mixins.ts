import { _ } from '@okta/courage';

declare module '@okta/courage' {
  interface OktaUnderscore {
    nestedOmit(obj: Record<string, any>, names): Record<string, any>
  }
}

_.mixin({
  nestedOmit: function(obj, names) {
    let result = _.omit(obj, names);

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
