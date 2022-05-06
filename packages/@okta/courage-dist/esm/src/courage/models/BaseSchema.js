import oktaUnderscore from '../util/underscore-wrapper.js';
import BaseCollection from './BaseCollection.js';
import BaseModel from './BaseModel.js';
import SchemaProperty from './SchemaProperty.js';

const parseProperties = function (resp) {
  const schemaMeta = oktaUnderscore.pick(resp, 'id', 'name', 'displayName');

  const properties = oktaUnderscore.map(resp.schema.properties, function (property, name) {
    return oktaUnderscore.extend({
      name: name
    }, property);
  });

  oktaUnderscore.each(properties, function (property) {
    property['__schemaMeta__'] = schemaMeta;

    if (property.__metadata) {
      property['__metadata__'] = property.__metadata;
      delete property.__metadata;
    }
  });

  return properties;
};

const BaseSchemaSchema = BaseModel.extend({
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
    const model = BaseModel.prototype.clone.apply(this, arguments);
    model.getProperties().set(this.getProperties().toJSON({
      verbose: true
    }));
    return model;
  },
  parse: function (resp) {
    const properties = parseProperties(resp);
    this.properties.set(properties, {
      parse: true
    });
    return oktaUnderscore.omit(resp, 'schema');
  },
  trimProperty: function (property) {
    return oktaUnderscore.omit(property, 'name');
  },
  toJSON: function () {
    const json = BaseModel.prototype.toJSON.apply(this, arguments);
    json.schema = {
      properties: {}
    };
    this.getProperties().each(function (model) {
      const property = model.toJSON();
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
const BaseSchemaSchemas = BaseCollection.extend({
  model: BaseSchemaSchema
});
var BaseSchema = {
  parseProperties: parseProperties,
  Model: BaseSchemaSchema,
  Collection: BaseSchemaSchemas
};

export { BaseSchema as default };
