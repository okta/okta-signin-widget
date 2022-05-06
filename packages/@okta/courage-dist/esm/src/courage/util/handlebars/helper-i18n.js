import _Handlebars2 from '../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
export { default } from '../../../../lib/handlebars/dist/cjs/handlebars.runtime.js';
import oktaUnderscore from '../underscore-wrapper.js';
import Logger from '../Logger.js';
import StringUtil from '../StringUtil.js';

/* eslint @okta/okta-ui/no-specific-modules: 0 */
const hbsEscape = _Handlebars2.Utils.escapeExpression;

function trim(str) {
  return str && str.replace(/^\s+|\s+$/g, '');
}

function replaceTagsWithPlaceholders(source, tag, tagValue) {
  const escapedBeginningTag = hbsEscape(`<${tag}>`);
  const escapedEndTag = hbsEscape(`</${tag}>`);
  const [beginningTag, endTag] = tagValue.split(tag);

  if (!source.includes(escapedBeginningTag) && !source.includes(escapedEndTag)) {
    throw Error(`Parsed tag "${tag}" is not present in "${source}"`);
  } else if (!tagValue.includes(tag)) {
    throw Error(`Parsed tag "${tag}" is not present in "${tagValue}"`);
  } else if (!beginningTag || !endTag) {
    throw Error(`Template value "${tagValue}" must contain beginning and closing tags`);
  }

  return source.replace(escapedBeginningTag, beginningTag).replace(escapedEndTag, endTag);
}
/* eslint max-statements: [2, 18] */


_Handlebars2.registerHelper('i18n', function i18n(options) {
  let params;
  const key = trim(options.hash.code);
  const bundle = trim(options.hash.bundle);
  const args = trim(options.hash.arguments);
  const tags = Object.keys(options.hash).filter(prop => prop.match(/^\$\d+/)).map(prop => ({
    tag: prop,
    value: options.hash[prop]
  }));

  if (args) {
    params = oktaUnderscore.map(trim(args).split(';'), function mapParam(param) {
      param = trim(param);
      let val;
      /*
       * the context(data) may be a deep object, ex {user: {name: 'John', gender: 'M'}}
       * arguments may be 'user.name'
       * return data['user']['name']
       */

      oktaUnderscore.each(param.split('.'), p => {
        val = val ? val[p] : this[p];
      });

      return val;
    }, this);
  }

  const localizedValue = StringUtil.localize(key, bundle, params);

  if (tags.length < 1) {
    // No HTML tags provided - return the localized and escaped string
    return localizedValue;
  }

  let escapedString = hbsEscape(localizedValue);

  try {
    tags.forEach(tag => {
      escapedString = replaceTagsWithPlaceholders(escapedString, tag.tag, tag.value);
    });
    return new _Handlebars2.SafeString(escapedString);
  } catch (err) {
    Logger.error(err.toString());
    return localizedValue;
  }
});
