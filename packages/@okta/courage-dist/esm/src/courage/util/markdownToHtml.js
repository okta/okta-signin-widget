import oktaUnderscore from './underscore-wrapper.js';

// Simple "markdown parser" - just handles markdown formatted links. If we
const RE_LINK = /\[[^\]]*\]\([^)]*\)/gi;
const RE_LINK_HREF = /\]\(([^)]*)\)/i;
const RE_LINK_TEXT = /\[([^\]]*)\]/i;
const RE_LINK_JS = /javascript:/gi; // Converts links
// FROM:
// [some link text](http://the/link/url)
// TO:
// <a href="http://the/link/url">some link text</a>

function mdToHtml(Handlebars, markdownText) {
  // TODO: use precompiled templates OKTA-309852
  // eslint-disable-next-line @okta/okta-ui/no-bare-templates
  const linkTemplate = Handlebars.compile('<a href="{{href}}">{{text}}</a>');
  /* eslint  @okta/okta-ui/no-specific-methods: 0*/

  let res;

  if (!oktaUnderscore.isString(markdownText)) {
    res = '';
  } else {
    res = Handlebars.Utils.escapeExpression(markdownText).replace(RE_LINK_JS, '').replace(RE_LINK, function (mdLink) {
      return linkTemplate({
        href: mdLink.match(RE_LINK_HREF)[1],
        text: mdLink.match(RE_LINK_TEXT)[1]
      });
    });
  }

  return new Handlebars.SafeString(res);
}

export { mdToHtml as default };
