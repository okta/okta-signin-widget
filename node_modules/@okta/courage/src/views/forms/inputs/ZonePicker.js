define([
  './BasePicker'
], function (BasePicker) {

  return BasePicker.extend({
    apiURL: '/api/v1/org/zones',
    nameAttribute: 'name'
  });
});
