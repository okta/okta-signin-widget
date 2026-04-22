import _Handlebars2 from '../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import _ from '../../../lib/underscore/underscore-min.js';

/* eslint @okta/okta-ui/no-specific-methods: 0, @okta/okta-ui/no-specific-modules: 0 */

_.mixin({
  resultCtx: function (object, property, context, defaultValue) {
    let value = _.isObject(object) ? object[property] : void 0;

    if (_.isFunction(value)) {
      value = value.call(context || object);
    }

    if (value) {
      return value;
    } else {
      return !_.isUndefined(defaultValue) ? defaultValue : value;
    }
  },
  isInteger: function (x) {
    return _.isNumber(x) && x % 1 === 0;
  },
  // TODO: This will be deprecated at some point. Views should use precompiled templates
  // eslint-disable-next-line @okta/okta-ui/no-bare-templates
  template: function (source, data) {
    const template = _Handlebars2.compile(source);

    if (data) {
      return template(data);
    }

    const fn = function (data) {
      return template(data);
    };

    fn.source = ''; // to conform with "CompiledTemplate" type definition

    return fn;
  }
});

const oktaUnderscore = _;

export { oktaUnderscore as default };
