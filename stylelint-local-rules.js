const stylelint = require('stylelint');
const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = 'okta/no-absolute-urls';
const messages = ruleMessages(ruleName, {
  expected: 'URLs starting with \'/\' are not allowed in SCSS files. Fix this by replacing with a relative link.',
});

module.exports = stylelint.createPlugin(ruleName, function getPlugin() {
  return function lint(root, result) {
    const validOptions = validateOptions(result, ruleName, {});
    if (!validOptions) { return; }
    root.walkDecls(decl => {
      const field = decl.toString().toLowerCase();
      const match = field.match(/url\(['"]\//g);
      if (match) {
        report({
          ruleName,
          result,
          message: messages.expected,
          node: decl,
        });
      }
    });
  };
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;
