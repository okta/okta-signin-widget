const loginEnBundle = require('../../../i18n/src/json/login.json');
const loginokPLBundle = require('../../../i18n/src/json/login_ok_PL.json');
const _ =  require('underscore');
module.exports = {
  meta: {
    docs: {
      description: 'Detect missing keys from login_ok_PL.properties',
      category: 'i18n Issues',
      recommended: true,
    },
    messages: {
      noMissingKeys: 'login_ok_PL.properties is not up-to-date with login.properties. Please run "grunt exec:pseudo-loc" to synchronize.'
    },
  },
  create(context) {
    return {
      'Program': function (node) {
        const fileName = context.getFilename();
        if (fileName.includes('login.json')) {
          // check if the en and ok_PL bundles are in sync
          const bundlesInSync = _.isEqual( Object.keys(loginEnBundle),Object.keys(loginokPLBundle));
          if (!bundlesInSync) {
            let loc = node.loc.start;
            context.report({
              messageId: 'noMissingKeys',
              node,
              loc,
            });
          }
        }
      },
    };
  },
};

