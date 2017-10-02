/* eslint okta/enforce-requirejs-names: 0, okta/no-specific-modules: 0, max-params: 0, max-statements: 0 */
define([
  'handlebars',
  'okta/underscore',
  'okta/jquery',
  'shared/util/StringUtil',
  'shared/util/markdownToHtml',
  'moment'
], function (Handlebars, _, $, StringUtil, markdownToHtml, moment) {

  var CACHE_BUST_URL_PREFIX = '/assets';

  function formatDate(format, dateInISOString) {
    return moment.utc(dateInISOString).zone('-07:00').format(format);
  }

  function trim(str) {
    return str && str.replace(/^\s+|\s+$/g, '');
  }

  function prependCachebustPrefix(path) {
    if (path.indexOf(CACHE_BUST_URL_PREFIX) === 0) {
      return path;
    }
    return CACHE_BUST_URL_PREFIX + path;
  }

  Handlebars.registerHelper('i18n', function (options) {
    var params,
        key = trim(options.hash.code),
        bundle = trim(options.hash.bundle),
        args = trim(options.hash['arguments']);

    if (args) {
      params = _.map(trim(args).split(';'), function (param) {
        param = trim(param);
        var val,
            data = this;
        /*
         * the context(data) may be a deep object, ex {user: {name: 'John', gender: 'M'}}
         * arguments may be 'user.name'
         * return data['user']['name']
         */
        _.each(param.split('.'), function (p) {
          val = val ? val[p] : data[p];
        });
        return val;
      }, this);
    }

    return StringUtil.localize(key, bundle, params);
  });

  Handlebars.registerHelper('xsrfTokenInput', function () {
    return new Handlebars.SafeString('<input type="hidden" class="hide" name="_xsrfToken" ' +
           'value="' + $('#_xsrfToken').text() + '">');
  });

  Handlebars.registerHelper('img', function (options) {
    /*global okta */
    var cdn = (typeof okta != 'undefined' && okta.cdnUrlHostname || '');
    var hash = _.pick(options.hash, ['src', 'alt', 'width', 'height', 'class', 'title']);
    hash.src = '' + cdn + prependCachebustPrefix(hash.src);
    var attrs = _.map(hash, function (value, attr) {
      return attr + '="' + Handlebars.Utils.escapeExpression(value) + '"';
    });
    return new Handlebars.SafeString('<img ' + attrs.join(' ') + '/>');
  });

  Handlebars.registerHelper('shortDate', _.partial(formatDate, 'MMM DD'));
  Handlebars.registerHelper('mediumDate', _.partial(formatDate, 'MMMM DD, YYYY'));
  Handlebars.registerHelper('longDate', _.partial(formatDate, 'MMMM DD, YYYY, h:mma'));
  Handlebars.registerHelper('formatDate', formatDate);


  Handlebars.registerHelper('markdown', function (mdText) {
    return markdownToHtml(Handlebars, mdText);
  });

  return Handlebars;

});
