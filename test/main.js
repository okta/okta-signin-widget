function requireAll(requireContext) {
  requireContext.keys().map(requireContext);
}
require('vendor/lib/underscore-wrapper');
require('vendor/lib/handlebars-wrapper');
require('vendor/lib/jquery-wrapper');
require('./vendor/jasmine-jquery');
var $ = require('jquery');
$('<div>').attr('id', 'sandbox').css({height: 1, overflow: 'hidden'}).appendTo('body');
requireAll(require.context('./spec', true, /.*/));
