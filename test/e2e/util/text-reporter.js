var grunt = require('grunt');

module.exports = function(result, threshold, writer) {
  var pass = true;

  function log(text, method) {
    grunt.log[method](text);
    writer.write(('' + text) + '\n');
  }

  log('# ' + result.url, 'subhead');
  var violations = result.violations;
  if (violations.length) {
    if (threshold < 0) {
      log('## Found ' + violations.length + ' accessibility violations: (no threshold)', 'ok');
    } else if (violations.length > threshold) {
      pass = false;
      log('## Found ' + violations.length + ' accessibility violations:', 'error');
    } else {
      log('## Found ' + violations.length + ' accessibility violations: (under threshold of ' + threshold + ')', 'ok');
    }
    log('', 'ok');

    violations.forEach(function(ruleResult) {
      log(ruleResult.help, 'subhead');

      ruleResult.nodes.forEach(function(violation, index) {
        log('   ' + (index + 1) + '. ' + JSON.stringify(violation.target), 'writeln');

        if (violation.any.length) {
          log('       Fix any of the following:', 'writeln');
          violation.any.forEach(function(check) {
            log('        \u2022 ' + check.message, 'writeln');
          });
        }

        var alls = violation.all.concat(violation.none);
        if (alls.length) {
          log('       Fix all of the following:', 'writeln');
          alls.forEach(function(check) {
            log('        \u2022 ' + check.message, 'writeln');
          });
        }
        log('', 'writeln');
      });
    });
  } else {
    log('Found no accessibility violations.', 'ok');
  }

  return pass;
};
