/* eslint max-params: [2, 8] */
define([
  'i18n!nls/messages',
  'i18n!nls/enduser',
  'i18n!nls/homepage',
  'i18n!nls/shared',
  'i18n!nls/selfservice',
  'i18n!nls/country'
], function (messages, enduser, homepage, shared, selfservice, country) {
  return {
    messages: messages,
    enduser: enduser,
    homepage: homepage,
    shared: shared,
    selfservice: selfservice,
    country: country
  };
});
