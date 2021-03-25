import { $ } from 'okta';

$.fn.trimmedText = function() {
  return $.trim(this.text());
};
