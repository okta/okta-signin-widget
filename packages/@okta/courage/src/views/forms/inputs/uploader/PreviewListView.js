define([
  'okta/underscore',
  'shared/views/BaseView',
  'shared/views/Backbone.ListView',
  'shared/util/TemplateUtil',
  'shared/util/Util'
], function (_, BaseView, ListView, TemplateUtil, Util) {

  function createItem(options) {

    function parse(src) {
      var data = (options.params && options.params.parse || _.identity).call(null, src);
      // run the per-uploder parse later, after the data is normalized by the per-intance parser
      return (options.parse || _.identity).call(null, data);
    }

    return BaseView.extend({

      className: 'file-upload-preview',

      events: {
        'click .file-upload-cancel': function (e) {
          e.preventDefault();
          e.stopPropagation();
          this.collection.remove(this.model);
        },
        'click .file-download': function (e) {
          e.preventDefault();
          e.stopPropagation();
          this.downloadFile();
        }
      },

      getTemplateData: function () {
        var item = parse(this.model.toJSON()),
            items = [_.omit(item, 'chain')].concat((item.chain || []).map(parse)),
            certNames = _.pluck(items, 'certName').join(' > '),
            canDownload = Boolean(options.params && options.params.downloadEndpoint);

        return _.extend({}, item, {
          certNames: certNames,
          nameOrDownload: item.name || certNames || canDownload,
          downloadClass: (canDownload) ? 'file-download' : '',
          multiItems: items.length > 1,
          items: items.map(function (val) {
            return _.extend({}, val, {
              multiItems: items.length > 1
            });
          })
        });

      },

      template: options.previewTemplate,

      postRender: function () {
        this.$el.prepend('<div class="file-upload-cancel"></div>');
        this.delegateEvents();
      },

      downloadFile: function () {
        var downloadEndpoint = _.result(options.params, 'downloadEndpoint');
        var url = _.isString(downloadEndpoint) ? TemplateUtil.tpl(downloadEndpoint) : downloadEndpoint;
        Util.redirect(url({id: this.model.id}));
      }
    });
  }

  return ListView.extend({
    className: 'file-upload-preview-wrap',
    constructor: function (options) {
      this.item = createItem(options);
      ListView.apply(this, arguments);
    }
  });

});
