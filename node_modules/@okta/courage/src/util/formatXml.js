/*global vkbeautify:false */
define(['vendor/plugins/vkbeautify.0.99.00.beta'], function () {

  // Uses vkbeautify to add in correct spacing. Escape flag can be passed in
  // to escape the xml for output.
  function formatXml(xml, escape) {
    xml = vkbeautify.xml(xml);
    if (escape) {
      xml = xml
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
    return xml;
  }

  return formatXml;

});