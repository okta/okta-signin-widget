define(['okta'], function (Okta) {
  const $ = Okta.$;

  let sandbox = $('#sandbox');
  if (!sandbox.length) {
    sandbox = $('<div>').attr('id', 'sandbox')
      .appendTo('body');
  }

  return sandbox;
});
