// Use a patched version of handlebars to precompile templates
// This runs in a node environment and should use the "full" version of handlebars

const Handlebars = require('handlebars'); // in node_modules

// Patch Handlebars.precompile to remove extra whitespace
require('./patch-precompile')(Handlebars);

module.exports = Handlebars;