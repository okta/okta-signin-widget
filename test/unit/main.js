require('vendor/lib/underscore-wrapper');
require('vendor/lib/handlebars-wrapper');
require('vendor/lib/jquery-wrapper');
require('./vendor/jasmine-jquery');
var $ = require('jquery');

// Create a hidden sandbox
$('<div>').attr('id', 'sandbox').css({height: 1, overflow: 'hidden'}).appendTo('body');

function requireAll(requireContext) {
  requireContext.keys().map(requireContext);
}

// Load all the specs
requireAll(require.context('./spec', true, /.*/));
