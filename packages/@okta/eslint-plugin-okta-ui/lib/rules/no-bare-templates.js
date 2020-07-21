const DEFAULT_MESSAGE = 'Template literal should be precompiled. Wrap template string in a call to hbs(\'template\') or use template syntax: hbs`template`';

function isHandlebarsTemplate(node) {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value.indexOf('{{') >= 0;
  }
  if (node.type === 'TemplateLiteral') {
    node.quasis.forEach(quasi => {
      let value = quasi.value.cooked;
      if (value.indexOf('{{') >= 0) {
        return true;
      }
    });
  }
  return false;
}

function isWrapped(node) {
  if (node.parent.type === 'TaggedTemplateExpression' && node.parent.tag.name === 'hbs') {
    return true;
  }
  if (node.parent.callee && node.parent.callee.name === 'hbs') {
    return true;
  }
  return false;
}

module.exports = {
  meta: {
    docs: {
      description: 'Detect use of bare (unwrapped) handlebars template strings',
      category: 'CSP Issues',
      recommended: true,
    },
    schema: [{
      type: 'array',
      minItems: 1,
      items: { type: 'object' },
      uniqueItems: true,
    }],
  },
  create(context) {
    return {
      // Find unwrapped template strings
      'Literal, TemplateLiteral': function (node) {
        if (!isHandlebarsTemplate(node) || isWrapped(node)) {
          return;
        }

        let loc = node.loc.start;
        let message = DEFAULT_MESSAGE;
        context.report({
          node,
          message,
          loc,
        });
      },
    };
  },
};

