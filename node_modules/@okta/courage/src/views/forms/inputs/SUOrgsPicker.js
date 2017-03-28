define(['./BasePicker'], function (BasePicker) {

  return BasePicker.extend({

    apiURL: '/api/internal/su/orgs',
    extraParams: {
      active: 1
    },
    queryParam: 'search',

    constructor: function () {
      BasePicker.apply(this, arguments);
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
