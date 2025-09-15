/* eslint-disable camelcase */
module.exports = {
  compress: {
    // Drop all console.* statements
    drop_console: false,
    drop_debugger: false,
    pure_funcs: [
      // don't drop 'Logger.*' statements
    ],
  },
  format: {
    comments: (node, comment) => {
      // Remove other Okta copyrights
      const isLicense = /^!/.test(comment.value) ||
                      /.*(([Ll]icense)|([Cc]opyright)|(\([Cc]\))).*/.test(comment.value);
      const isOkta = /.*Okta.*/.test(comment.value);

      // Some licenses are in inline comments, rather than standard block comments.
      // UglifyJS2 treats consecutive inline comments as separate comments, so we
      // need exceptions to include all relevant licenses.
      const exceptions = [
        'Chosen, a Select Box Enhancer',
        'by Patrick Filler for Harvest',
        'Version 0.11.1',
        'Full source at https://github.com/harvesthq/chosen',

        'Underscore.js 1.8.3'
      ];

      const isException = exceptions.some(exception => {
        return comment.value.indexOf(exception) !== -1;
      });
      return (isLicense || isException) && (!isOkta);
    },
  }
};
