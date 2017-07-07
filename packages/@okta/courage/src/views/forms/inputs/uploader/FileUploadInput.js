define([
  'okta/jquery',
  'okta/underscore',
  'shared/views/BaseView',
  'shared/util/Logger',
  'shared/util/StringUtil'
], function ($, _, BaseView, Logger, StringUtil) {


  function createAcceptFileTypes(fileTypes) {
    return (fileTypes || []).join(',');
  }

  return BaseView.extend({

    className: 'file-upload-wrap',

    template: '\
      <span class="file-upload-progress-indicator-wrap input-fix o-form-control hide">\
        <span class="file-upload-progress-indicator"></span>\
        <div class="file-upload-cancel file-upload-uploading"></div>\
      </span>\
      <div class="facade">\
        <input type="text" class="file-name-text-field" placeholder="{{placeholder}}" \
               title="{{browseFilesTitle}}" readonly>\
        <a title="{{browseFilesTitle}}" class="browse-file-button link-button" href="#">{{browseFilesTitle}}</a>\
      </div>\
      <div class="o-form-explain hide"></div>\
      <input type="file" class="m-file hide"{{#if accept}} accept="{{accept}}"{{/if}}\
             {{#if multiple}} multiple="multiple"{{/if}}>\
    ',

    events: {
      'click .file-upload-cancel': function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.abortRequest();
        this.render();
      },
      'click .facade': function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.browseFiles();
      },
      'change .m-file': function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.makeRequest(e.target.files);
      }
    },

    initialize: function () {
      _.bindAll(this, 'onProgress', 'onProgressComplete');
      this.onSuccess = _.debounce(this.onSuccess, 1000);

      this.listenTo(this.model, 'change:__edit__', this.render);
    },

    getTemplateData: function () {
      return {
        browseFilesTitle: StringUtil.localize('oform.browse.files'),
        accept: createAcceptFileTypes(this.options.fileTypes),
        multiple: this.options.multi,
        placeholder: this.options.placeholder
      };
    },

    postRender: function () {
      this.delegateEvents();
    },

    browseFiles: function () {
      this.$('.m-file').val('').click();

      // delay hiding errors, so it does it after the file browser dialog is open (on the "background")
      _.delay(function () {
        this.trigger('clear');
      }.bind(this), 2000);
    },

    setCollection: function (collection) {
      this.collection = this.options.collection = collection;
      this.listenTo(collection, 'update', function () {
        this.toggle(collection.length === 0);
      });
    },

    setFileName: function (displayName) {
      this.$('.file-name-text-field').val(displayName || '');
      this.$('.file-upload-progress-indicator').html(displayName || '');
    },

    startUploading: function (displayName) {
      this.$('.file-upload-progress-indicator-wrap').removeClass('hide');
      this.$('.file-upload-progress-indicator').css('width', '0px');
      this.$('.facade').hide();
      this.$('.file-upload-cancel').show();
      this.setFileName(displayName);
    },

    /**
     * As long as user chooses an file, upload to server and then display meta data.
     * It will do nothing if File API is not supported or no file selected.
     */
    makeRequest: function (files) {
      if (files.length === 0) {
        Logger.warn('No files have been selected.');
        return;
      }

      var displayFileName = _.pluck(files, 'name').join(', '),
          maxItems = this.getMaxItems();

      if (files.length + this.collection.length > maxItems) {
        this.trigger(
          'error',
          StringUtil.localize('oform.file.upload.too.many.files', 'messages', [maxItems])
        );
        return;
      }

      this.trigger('clear');

      this.startUploading(displayFileName);

      this.sendUploadRequest(files)
        .done(_.bind(this.onSuccess, this))
        .fail(_.bind(this.onFailure, this));
    },

    sendUploadRequest: function (files) {
      var self = this,
          formData = new FormData(),
          fileFieldName = this.options.fileFieldName;

      _.each(files, function (file) {
        formData.append(fileFieldName, file);
      });

      formData.append('_xsrfToken', $('#_xsrfToken').text());

      var options = {
        url: this.options.endpoint,
        method: 'POST',
        data: formData,
        xhr: function () {
          var xhr = $.ajaxSettings.xhr() ;
          xhr.upload.addEventListener('progress', self.onProgress, false);
          xhr.upload.addEventListener('load', self.onProgressComplete, false);
          return xhr ;
        },
        // do not convert data to string
        processData: false,
        // to avoid override header content type. particularly for boundary
        contentType: false
      };
      this._xhr = $.ajax(options);
      return this._xhr;
    },

    abortRequest: function () {
      Logger.warn('Upload aborted...');
      if (this._xhr) {
        this._xhr.abort();
      }
    },

    onProgress: function (e) {
      if (e.lengthComputable) {
        var percentage = Math.round((e.loaded * 100) / e.total);
        Logger.info('Upload in progress...', percentage + '%');
        this.$('.file-upload-progress-indicator').css('width', (percentage + '%'));
        return percentage; // test hook
      }
    },

    onProgressComplete: function () {
      Logger.info('Upload complete, processing...');
      this.$('.file-upload-cancel').fadeOut();
    },

    onSuccess: function (resp) {
      Logger.info('Upload processing complete...');
      this.$('.file-upload-progress-indicator-wrap').addClass('hide');
      this.toggle(false);
      this.trigger('success', resp);
    },

    onFailure: function (xhr) {
      Logger.warn('Upload failed...');
      this.setFileName();
      this.$('.file-upload-progress-indicator-wrap').addClass('hide');
      this.$('.facade').show();
      this.toggle(true);
      this.trigger('error', xhr);
    },

    toggle: function (bool) {
      this.$el.addClass('hide');

      var doShow = bool;
      if (this.options.multi) {
        doShow = this.collection.length < this.getMaxItems();
      }
      else if (this.collection.length > 0) {
        doShow = false;
      }

      if (doShow) {
        this.render().$el.removeClass('hide');
      }
      return doShow; // test hook
    },

    focus: function () {
      this.$('.facade').focus();
    },

    getMaxItems: function () {
      var schema = this.model.getPropertySchema(this.options.name) || {};
      return schema.maxItems || Infinity;
    }

  });

});
