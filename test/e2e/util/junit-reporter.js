var junitReportBuilder = require('junit-report-builder');

function checkMessages(checks) {
  return checks.reduce(function(messages, check) {
    messages += '    \u2022 ' + check.message + '\n';
    if (check.relatedNodes && check.relatedNodes.length) {
      messages += '    Related Nodes:\n';
      check.relatedNodes.forEach(function(relatedNode) {
        messages += '        \u25E6 ' + relatedNode.target[0];
      });
    }
    return messages;
  }, '');
}

module.exports = function(result, outFile) {
  var suite = junitReportBuilder.testSuite()
    .name(result.url)
    .timestamp(new Date().getTime())
    .time(new Date().toGMTString());

  var packageName = result.url;

  result.violations.forEach(function(ruleResult) {

    ruleResult.nodes.forEach(function(violation) {
      var failure = ruleResult.help + ' (' + ruleResult.helpUrl + ')\n';
      var stacktrace = 'Target: ' + violation.target + '\n\n' +
        'HTML: ' + violation.html + '\n\n' +
        'Summary:\n';

      if (violation.any.length) {
        stacktrace += 'Fix any of the following:\n';
        stacktrace += checkMessages(violation.any);
      }

      var alls = violation.all.concat(violation.none);
      if (alls.length) {
        stacktrace += 'Fix all of the following:\n';
        stacktrace += checkMessages(alls);
      }

      suite.testCase()
        .className(packageName + '.' + ruleResult.id)
        .name(violation.target)
        .failure(failure)
        .stacktrace(stacktrace);
    });
  });

  result.passes.forEach(function(ruleResult) {
    ruleResult.nodes.forEach(function(pass) {
      suite.testCase()
        .className(packageName + '.' + ruleResult.id)
        .name(pass.target);
    });
  });

  junitReportBuilder.writeTo(outFile);
};
