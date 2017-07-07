define([
  'okta/underscore',
  './BaseModel',
  './BaseCollection',
  './SchemaProperty'
], function (_, BaseModel, BaseCollection, SchemaProperty) {

  var parseProperties = function (resp) {
    var schemaMeta = _.pick(resp, 'id', 'name', 'displayName');
    var properties = _.map(resp.schema.properties, function (property, name) {
      return _({name: name}).chain().extend(property).omit('__metadata').value();
    });
    _.each(properties, function (property) {
      property['__schemaMeta__'] = schemaMeta;
    });
    return properties;
  };

  var Schema = BaseModel.extend({

    defaults: {
      id: undefined,
      displayName: undefined,
      name: undefined
    },

    constructor: function () {
      this.properties = new SchemaProperty.Collection();
      BaseModel.apply(this, arguments);
    },

    getProperties: function () {
      return this.properties;
    },

    clone: function () {
      var model = BaseModel.prototype.clone.apply(this, arguments);
      model.getProperties().set(this.getProperties().toJSON({verbose: true}));
      return model;
    },

    parse: function (resp) {
      var properties = parseProperties(resp);
      this.properties.set(properties, {parse: true});
      return _.omit(resp, 'schema');
    },

    trimProperty: function (property) { return _.omit(property, 'name'); },

    toJSON: function () {
      var json = BaseModel.prototype.toJSON.apply(this, arguments);
      json.schema = {properties: {}};
      this.getProperties().each(function (model) {
        var property = model.toJSON();
        json.schema.properties[property.name] = this.trimProperty(property);
      }, this);
      return json;
    },

    save: function () {
      this.getProperties().each(function (model) {
        model.cleanup();
      });
      return BaseModel.prototype.save.apply(this, arguments);
    }
  });

  var Schemas = BaseCollection.extend({
    model: Schema
  });

  return {
    parseProperties: parseProperties,
    Model: Schema,
    Collection: Schemas
  };

});
