define([
  'okta/underscore',
  './BasePicker'
],
function (_, BasePicker) {

  return BasePicker.extend({

    apiURL: '/api/v1/users',
    extraParams: {
      expand: 'stats'
    },

    onlyActiveUser: false,

    parse: function (entity) {
      var profile = _.pick(entity.profile, 'firstName', 'lastName', 'email');
      return _.extend(_.pick(entity, 'id'), profile, {
        name: profile.firstName + ' ' + profile.lastName + ' (' + profile.email + ')'
      });
    },

    parseAll: function (entities) {
      var activeUsers = entities;

      if (this.getAttribute('onlyActiveUser') === true) {
        activeUsers = _.filter(entities, this.isActiveUser);
      }

      return BasePicker.prototype.parseAll.call(this, activeUsers);
    },

    isActiveUser: function (user) {
      return user.status === 'ACTIVE';
    }

  });

});
