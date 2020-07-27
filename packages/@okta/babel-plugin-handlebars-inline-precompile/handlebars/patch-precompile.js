// Monkey patch handlebars to remove extra whitespace from templates before they are precompiled
module.exports = function (Handlebars) {
  const precompile = Handlebars.precompile;
  Handlebars.precompile = function (template) {
    // Trim extra whitespace from template
    template = template
      .replace(/\s+</g, '<') // all spaces before opening tag
      .replace(/>\s+/g, '>') // all spaces after closing tag
      .replace(/}}\s+{{/g, '}}{{') // all spaces betwen mustaches
      .replace(/\s+/g, ' ') // multiple spaces become one
      .trim(); // remove spaces from beginning and end

    // console.log('Template: |' + template + '|');
    return precompile.apply(Handlebars, [template]);
  };
  return Handlebars;
};
