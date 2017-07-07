/* eslint max-params: [2, 11] */
define([
  'okta/jquery',
  'okta/underscore',
  '../BaseInput',
  'shared/models/Model',
  'shared/models/BaseCollection',
  'shared/views/forms/helpers/ErrorParser',
  'shared/util/StringUtil',
  'shared/util/TemplateUtil',
  './uploader/FileUploadInput',
  './uploader/PreviewListView'
], function ($, _, BaseInput, Model, BaseCollection, ErrorParser, StringUtil, TemplateUtil, FileUploadInput,
             PreviewListView) {

  function parseJSON(source) {
    if (!_.isString(source)) {
      return _.clone(source);
    }
    try {
      return JSON.parse(source);
    }
    catch (e) {
      return ;
    }
  }

  return BaseInput.extend({

    idAttribute: 'id',

    /**
     * @property {String} template for rendering preview content.
     * @abstract
     */
    previewTemplate: null,

    /**
     * @property {Array|Function} to suggest only to select particular file types otherwise any type of files.
     * @link https://www.w3.org/TR/html-markup/input.file.html
     *
     * @example
     * ['.png','.jpg']
     * ['.csv']
     * ['.crt', '.pem']
     *
     */
    fileTypes: null,

    /**
     * Transform/normalise the response before rendering if necessary. default is _.identity.
     * @type {Function}
     */
    parse: _.identity,

    /**
     * @property {String|Function} form field for file submit request.
     */
    fileFieldName: 'file',

    fileUploadInputEvents: {
      clear: 'clearError',
      success: 'addFileData',
      error: 'showError'
    },

    constructor: function (options) {
      /* eslint max-statements: [2, 18] */

      var opts = _.extend({
        fileTypes: _.result(this, 'fileTypes'),
        fileFieldName: _.result(options.params, 'fileFieldName') || _.result(this, 'fileFieldName'),
        endpoint: _.result(this, 'endpoint')
      }, options, this.getParams(options));
      this.fileUploadInput = new FileUploadInput(opts);

      BaseInput.apply(this, arguments);

      var Collection = BaseCollection.extend({
        model: Model.extend({
          extraProperties: true,
          idAttribute: this.getParamOrAttribute('idAttribute')
        })
      });

      this.collection = new Collection();

      this.previewListView = new PreviewListView({
        collection: this.collection,
        params: options.params,
        parse: this.parse,
        previewTemplate: this.previewTemplate
      });

      this.fileUploadInput.setCollection(this.collection);

      this.listenTo(this.collection, 'update', this.update);
      this.listenTo(this.collection, 'update', this.resize);

      this.$el.append(this.fileUploadInput.render().el);
      this.$el.append(this.previewListView.render().el);

      this.$el.addClass('o-form-control file-upload clearfix');
    },

    previewFromModel: function () {
      this.collection.reset();

      var id = this.getModelValue(),
          previewData = this.getParam('previewData'),
          previewEndpoint = this.getParam('previewEndpoint'),
          collection = this.collection;

      if (id) {
        if (previewData) {
          collection.set(previewData);
        }
        else if (previewEndpoint) {
          var url = _.isString(previewEndpoint) ? TemplateUtil.tpl(previewEndpoint) : previewEndpoint;

          var promisses = _.map(_.isArray(id) ? id : [id], function (id) {
            return $.get(url({id: id}));
          });

          $.when.apply($, promisses).then(function () {
            var data = promisses.length == 1 ? arguments[0] : _.pluck(arguments, 0);
            collection.set(data);
          });

        }
      }
    },

    clearError: function () {
      this.model.trigger('form:clear-error:' + this.options.name);
    },

    addFileData: function (resp) {
      var model = parseJSON(resp);
      if (model) {
        this.collection.add(model);
      }
    },


    showError: function (resp) {
      this.clearError();

      if (resp && resp.status === 0 && resp.statusText == 'abort') {
        return ;
      }

      var errorSummary;
      if (_.isString(resp)) {
        errorSummary = resp;
      }
      else {
        var data = ErrorParser.getResponseJSON(resp);
        errorSummary = data && data.errorSummary || StringUtil.localize('oform.file.upload.error');
      }

      var validationError = {};
      validationError[this.options.name] = errorSummary;
      this.model.trigger('invalid', this.model, validationError, false);
    },

    /**
     * BASE INPUT OVERRIDES
     */

    editMode: function () {
      this.previewFromModel();
      this.fileUploadInput.toggle(true);
    },

    readMode: function () {
      return this.editMode();
    },

    val: function () {
      var data = this.collection.pluck(this.getParamOrAttribute('idAttribute'));
      return this.getParam('multi') ? data : data[0];
    },

    focus: function () {
      this.fileUploadInput.focus();
    },

    // skip inline validation
    validate: _.noop

  }, {
    // test hooks
    parseJSON: parseJSON
  });

});
