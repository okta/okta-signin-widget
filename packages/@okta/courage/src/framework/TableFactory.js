(function (root, factory) {
  if (typeof define == 'function' && define.amd) {
    define(['okta/underscore', './View'], factory);
  }
  /* global module, exports */
  else if (typeof require == 'function' && typeof exports == 'object') {
    module.exports = factory(require('okta/underscore'), require('./View'));
  }
  else {
    root.Archer || (root.Archer = {});
    root.Archer.TableFactory = factory(root._, root.Archer.View);
  }
}(this, function (_, View) {

  function normalizeField(fields) {
    return _.map(fields, function (field) {
      if (_.isString(field)) {
        field = {name: field};
      }
      if (!field.name && field.field) {
        field = _.extend({name: field.field}, field); // immutability matters
      }
      return field;
    });
  }

  function cleanEvents(events) {
    var target = {};
    _.each(events || {}, function (fn, eventName) {
      target[eventName] = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (_.isFunction(fn)) {
          fn.apply(this, arguments);
        }
      };
    }, this);
    return target;
  }

  /**
   * @class Archer.TableFactory
   * @private
   *
   * A set of factory methods for {@link Archer.TableView} creation
   */

  return {

    /**
     * Creates a header view (thead)
     * @static
     * @param {Object[]} fields field definitions to create the header row from
     * @return {Archer.View} The header row view
     */
    createHeader: function createHeader(fields) {
      return View.extend({
        tagName: 'thead',
        template: '<tr></tr>',
        initialize: function () {
          _.each(normalizeField(fields), function (field) {
            this.add(View.extend({
              tagName: 'th',
              children: field.headerView && [field.headerView],
              template: field.headerView ? null : field.label || '&nbsp;',
              attributes: function () {
                return _.extend({
                  role: 'columnheader'
                }, field.headAttributes || {});
              }
            }), 'tr');
          }, this);
        }
      });
    },

    /**
     * Creates a table row view (tbody/tr)
     * @static
     * @param {Object[]} fields field definitions to create the table row from
     * @return {Archer.View} The row view
     */
    createRow: function createRow(fields) {
      var factory = this;
      return View.extend({
        tagName: 'tbody',
        template: '<tr role="row"></tr>',
        children: _.map(normalizeField(fields), function (field) {
          return [factory.createCell(field), 'tr'];
        })
      });
    },

    /**
     * Creates a table cell view (td)
     * @static
     * @param {Object} field field definition
     * @return {Archer.View} The cell view
     */
    createCell: function createCell(field) {
      var proto = _.extend(_.pick(field, 'className', 'attributes', 'initialize'), { 
        tagName: 'td',
        events: cleanEvents(field.events),
        children: field.view && [field.view],
        template: field.view ? null : field.template || '{{' + field.name + '}}',
        postRender() {
          const maxWidth = _.result(field, 'maxWidth');
          const $el = this.$('div').length ? this.$('div') : this.$el;
          if (_.isNumber(maxWidth)) {
            $el.css('max-width', maxWidth + 'px');
            $el.addClass('column-no-wrap');
          }
        }
      });
      return View.extend(proto);
    },

    // test hooks
    __normalizeFields: normalizeField,
    __cleanEvents: cleanEvents
  };

}));
