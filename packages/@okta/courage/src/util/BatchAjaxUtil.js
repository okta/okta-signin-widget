define([
  'okta/jquery',
  'okta/underscore'
], function ($, _) {

  var DEFAULTS = {
    queryBuildFn: _.noop,
    batchSize: 20
  };

  return {

    /**
     * Concurrently fetch per batch size.
     *
     * @param {Object} [option]
     * @param {String} [option.url] URL root
     * @param {Function} [option.queryBuilderFn] create extra parameters.
     * @param {Int} [option.batchSize] batch size
     * @param {Array} ids an list of elements (usually IDs) to help build extra parameters.
     * @return {Promise}
     */
    getByIds: function (option) {
      /* eslint complexity: [2, 7] */
      var opt = _.defaults({}, option, DEFAULTS),
          ids = opt.ids;

      if (!_.isString(opt.url)) {
        throw new Error('Expecting an string URL but get: ' + opt.url);
      }

      if (!_.isArray(ids) || _.isEmpty(ids)) {
        throw new Error('Expecting an list of IDs but get: ' + ids);
      }

      if (!_.isNumber(opt.batchSize) || opt.batchSize === 0 || ids.length <= opt.batchSize) {
        return $.get(opt.url, opt.queryBuildFn(ids));
      }

      // 1. [ID] -> [[ID]] (groupBy and values)
      // 2. [[ID]] -> [XHR] (map)
      var idss = _.chain(ids)
            .groupBy(function (id, index) { return Math.floor(index / opt.batchSize); })
            .values()
            .map(function (xs) { return $.get(opt.url, opt.queryBuildFn(xs)); }, this)
            .value();

      // 3. batch API call and merge response into single array.
      return $.when.apply($, idss)
        .then(function () {
          // regarding structure of `arguments`, @see https://api.jquery.com/jquery.when/
          return _.chain(arguments)
            .map(_.first)
            .flatten()
            .value();
        });
    }
  };
});
