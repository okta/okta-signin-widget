define([
  'shared/util/Events',
  'shared/views/BaseView',
  './UploadIframe',
  './UploadForm'
], function (Events, BaseView, UploadIframe, UploadForm) {

  var View = BaseView.extend({

    className: 'upload-holder',

    initialize: function () {
      this.iframe = new UploadIframe({
        name: this.cid
      });
      this.add(this.iframe, null, true);

      this.uploadForm = new UploadForm({
        target: this.cid,
        endpoint: this.options.endpoint
      });
      this.add(this.uploadForm, null, true);

      // We need to tell the form the upload is done so it can
      // re-enable buttons, etc.
      this.listenTo(this.iframe, Events.UPLOAD_DONE, function () {
        this.uploadForm.uploadDone();
      });
      return this;
    }
  });

  return View;
});
