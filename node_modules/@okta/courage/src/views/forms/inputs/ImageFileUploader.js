define(['okta/underscore', './BaseFileUploader'], function (_, BaseFileUploader) {

  return BaseFileUploader.extend({

    className: 'image-file-upload',

    parse: function (src) {
      var target = _.clone(src || {});
      if (target.size) {
        target.fileSizeKB = Math.round(target.size / 1000);
      }
      return target;
    },

    previewTemplate: '\
      <div class="image-file-thumbnail float-l">\
        <img src="{{imageUrl}}" >\
      </div>\
      <div class="image-file-info float-l">\
        <ul>\
          {{#if name}}<li>{{name}}</li>{{/if}}\
          {{#if fileSizeKB}}<li>{{fileSizeKB}}(KB)</li>{{/if}}\
        </ul>\
      </div>',

    fileTypes: ['.png', '.gif', '.jpeg', '.jpg']

  });

});
