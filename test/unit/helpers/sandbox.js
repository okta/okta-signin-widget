import { $ } from 'okta';

let sandbox = $('#sandbox');
if (!sandbox.length) {
  sandbox = $('<div>').attr('id', 'sandbox').appendTo('body');
}

export default sandbox;
