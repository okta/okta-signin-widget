define(['./BaseSelectize'], function (BaseSelectize) {

  return BaseSelectize.extend({

    apiURL: '/api/internal/su/orgs',
    extraParams: {
      active: 1
    },
    queryParam: 'search',

    constructor: function () {
      BaseSelectize.apply(this, arguments);
      var samecell = this.getParam('samecell');
      if (samecell) {
        this.extraParams.samecell = samecell;
      }
    },

    buildPrefetchQuery: function (ids) {
      return {limit: ids.length, ids: ids.join(',')};
    }

  });
});
