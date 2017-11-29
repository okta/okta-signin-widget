/* eslint max-params: [2, 10], max-statements: 0 */
define([
  'okta/jquery',
  'okta/underscore',
  'shared/util/StringUtil',
  '../BaseInput',
  'shared/views/BaseView',
  'shared/models/BaseCollection',
  'shared/models/Model',
  'shared/util/ButtonFactory',
  'shared/views/Backbone.ListView',
  'shared/util/StateMachine'
], function ($, _, StringUtil, BaseInput, BaseView, BaseCollection, Model, ButtonFactory, ListView, StateMachine) {

  function getCollection(options, data) {

    var props = {},
        schema = options.model.getPropertySchema(options.name),
        item = schema && schema.item;

    props[options.name] = _.extend({type: 'any'}, item || {});

    var MyModel = Model.extend({
      props: props,
      extraProperties: true
    });

    var Collection = BaseCollection.extend({
      model: MyModel
    });

    return new Collection(data);
  }


  function hideOnReadMode() {
    this.$el.hide();
  }

  function getInputNames(options) {
    if (options.params.inputs[0].type == 'group') {
      return getInputNames(options.params.inputs[0]);
    }
    return _.compact(_.pluck(options.params.inputs, 'name'));
  }

  function getEmptyValue(options) {
    var defaultValues = options.model.pick('__edit__') || {};
    var names = getInputNames(options);
    _.extend(defaultValues, _.object(names, _.map(names, _.constant(''))));
    return defaultValues;
  }

  function isDragSortingEnabled(options) {
    return options.params && options.params.dragSorting ? options.params.dragSorting : false;
  }

  var sortHelper = function (e, ui) {
    var $originals = ui.find('td'),
        $helper = _.clone(ui);

    _.each($helper.find('td'), function (elm, index) {
      $(elm).width($originals.eq(index).width()).addClass('list-input-sortable-background');
    });

    return $helper;
  };

  var AddNewItemButton = ButtonFactory.create({
    title: function () {
      return this.options.params.addLabel || StringUtil.localize('oform.add.another', 'courage');
    },

    icon: 'add-16-thin',
    readMode: hideOnReadMode,

    click: function () {
      this.collection.trigger('list:add');
    },

    toggleEnabled: function (isEnable) {
      isEnable ? this.enable() : this.disable();
      this.tooltip && this.tooltip.disable(isEnable);
    },

    getMaxItems: function () {
      var schema = this.model.getPropertySchema(this.options.name) || {};
      return schema.maxItems;
    },

    initialize: function () {

      var maxItems = this.getMaxItems();

      if (_.isNumber(maxItems)) {
        var tooltipText = this.options.params.maxItemsTooltip ||
                          StringUtil.localize('oform.listInput.maxItems', 'courage', [maxItems]);

        this.$el.qtip({
          style: {
            classes: 'qtip-custom qtip-shadow',
            tip: true
          },
          position: {
            my: 'bottom center',
            at: 'top center'
          },
          content: {
            text: tooltipText
          }
        });

        this.tooltip = this.$el.qtip('api');
      }
    }
  });

  var RemoveItemButton = BaseView.extend({
    tagName: 'td',
    className: 'list-input-button',
    children: [
      ButtonFactory.create({
        icon: 'cancel-16',
        readMode: hideOnReadMode,

        modelEvents: {
          'change:__destroyable__': '_updateVisibility'
        },

        click: function () {
          this.model.trigger('list:remove', this.model);
        },

        postRender: function () {
          this._updateVisibility();
        },

        _updateVisibility: function () {
          this.$el.toggle(this.model.get('__destroyable__'));
        }
      })
    ]
  });

  var DragDropGripper = BaseView.extend({
    tagName: 'td',

    className: 'list-input-gripper-cell',

    template: '<div class="list-input-gripper">&#8285;</div>',

    collectionEvents: {
      'update': '_updateVisibility'
    },

    readMode: function () {
      this._hideButton();
    },

    editMode: function () {
      this._updateVisibility();
    },

    _updateVisibility: function () {
      if (this.collection.length > 1) {
        this._showButton();
      } else {
        this._hideButton();
      }
    },

    _showButton: function () {
      this.$el.find('.list-input-gripper').show();
    },

    _hideButton: function () {
      this.$el.find('.list-input-gripper').hide();
    }
  });

  var ItemView = BaseView.extend({
    tagName: 'tr',

    className: function () {
      return 'list-input-row list-input-items-' + _.size(this.options.params.inputs);
    },

    attributes: function () {
      if (isDragSortingEnabled(this.options)) {
        return {'list-input-row-id': _.uniqueId()};
      }
    },

    children: function () {
      var removeItemButtonView = this.options.params.removeItemButtonView || RemoveItemButton;
      var inputs = _.map(this.options.params.inputs, function (input) {
        var params = this.options.params;
        return BaseView.extend({
          tagName: 'td',
          className: 'list-input-cell o-form-wide',
          children: [params.create(_.defaults({
            model: this.model,
            params: _.defaults({wide: true}, params, input.params, {state: this.state})
          }, input))],
          focus: function () {
            this.size() && this.first().focus();
          }
        });
      }, this).concat([removeItemButtonView]);

      return isDragSortingEnabled(this.options) ? [DragDropGripper].concat(inputs) : inputs;
    },

    focus: function () {
      isDragSortingEnabled(this.options) ? this.at(1).focus() : this.first().focus();
    }
  });

  var InputListView = ListView.extend({

    tagName: 'table',

    template: '\
      <tfoot>\
        <tr><td class="list-input-cell" colspan="99"></td></tr>\
      </tfoot>\
      <tbody>\
      {{#if labels}}\
        <tr>\
          {{#if dragSorting}}\
            <th class="list-input-gripper-header"></th>\
          {{/if}}\
          {{#each labels}}\
            <th>{{this}}</th>\
          {{/each}}\
          <th></th>\
        </tr>\
      {{/if}}\
      </tbody>\
    ',

    item: ItemView,

    itemSelector: 'tbody',

    _modelDefaults: {},

    _dragSorting: false,

    initialize: function () {
      this.add(AddNewItemButton, 'tfoot td');
      this.addNewItemButton = this.last();

      var schema = this.model.getPropertySchema(this.options.name) || {};
      this._schema = _.defaults(schema, {minItems: 0, maxItems: Infinity});
      this._modelDefaults = getEmptyValue(this.options);
      this._dragSorting = isDragSortingEnabled(this.options);

      this._prefillCollection();
    },

    getTemplateData: function () {
      var labels = _.values(_.pluck(this.options.params.inputs, 'label'));
      return {
        labels: _.some(labels) && labels,
        numLabels: labels.length,
        dragSorting: this._dragSorting
      };
    },

    collectionEvents: function () {
      return {
        'list:remove': '_removeCollectionItem',
        'list:add': '_addCollectionItem',
        'add remove reset': '_updateElements'
      };
    },

    postRender: function () {
      this._updateElements();
    },

    _canAddNewItem: function () {
      return this.collection.length < this._schema.maxItems;
    },

    _updateRowsCanBeRemoved: function () {
      var canDelete = this._schema.minItems < this.collection.length;
      this.collection.each(function (model) {
        model.set('__destroyable__', canDelete);
      });
    },

    _removeCollectionItem: function (model) {
      if (model.get('__destroyable__')) {
        model.destroy();
      }
    },

    _addCollectionItem: function () {
      if (this._canAddNewItem()) {
        this.collection.add(this._getEmptyModels(1));
      }
    },

    _prefillCollection: function () {
      var minItems = this._schema.minItems;
      var length = this.collection.length;

      if (minItems > length) {
        this.collection.add(this._getEmptyModels(minItems - length));
      }
    },

    _getEmptyModels: function (count) {
      var modelDefaults = this._modelDefaults;
      return _.map(_.range(count), function () {
        return _.clone(modelDefaults);
      });
    },

    _getSortableDom: function () {
      return this.$el.find('tbody');
    },

    _getSelectedRowPosition: function (ui) {
      var rowId = ui.item.attr('list-input-row-id');
      return this._getSortableDom().sortable('toArray', {attribute: 'list-input-row-id'}).indexOf(rowId);
    },

    _sortStart: function (event, ui) {
      var order = this._getSelectedRowPosition(ui);
      this._sortingItemBeginIndex = order;
    },

    _sortStop: function (even, ui) {
      var sortingItemEndIndex = this._getSelectedRowPosition(ui);

      if (sortingItemEndIndex !== this._sortingItemBeginIndex) {
        var moveModel = this.collection.at(this._sortingItemBeginIndex);
        this.collection.remove(moveModel, {silent: true});
        this.collection.add(moveModel, {at: sortingItemEndIndex, silent: true});

        // Silent 'add' and 'remove' so it does not render the view again,
        // instead trigger the update event in order to update model value.
        this.collection.trigger('change');
      }
    },

    _updateDragSorting: function () {
      if (this._dragSorting && this.collection.length > 1) {
        this._getSortableDom().sortable({
          items: '> .list-input-row',
          axis: 'y',
          handle: '.list-input-gripper',
          placeholder: 'list-input-sortable-placeholder',
          forcePlaceholderSize: true,
          helper: sortHelper,
          start: this._sortStart.bind(this),
          stop: this._sortStop.bind(this)
        });
      }
    },

    _updateElements: function () {
      this.addNewItemButton.toggleEnabled(this._canAddNewItem());
      this._updateRowsCanBeRemoved();
      this._updateDragSorting();

      this.model.trigger('form:resize');
      _.defer(this.focus.bind(this));
    },

    focus: function () {
      this.size() > 1 && this.last().focus();
    }
  });

  return BaseInput.extend({

    tagName: 'div',
    className: 'o-form-list-input',

    constructor: function () {
      BaseInput.apply(this, arguments);
      this.options.state = new StateMachine();
    },

    render: function () {
      var collection = this.collection = this.options.collection = getCollection(this.options, this.getModelValue());

      this.listenTo(collection, 'add remove reset update change', _.debounce(this.update, 20));

      this.listView = new InputListView(_.extend({collection: collection}, this.options));
      this.$el.html(this.listView.render().el);

      this.listenTo(this.model, 'change:__edit__', function (model, edit) {
        collection.each(function (model) {
          model.set('__edit__', edit);
        });
      });

      return BaseInput.prototype.render.apply(this, arguments);
    },

    editMode: function () {
      this.listView.invoke('editMode');
    },

    readMode: function () {
      this.editMode();
      this.listView.invoke('readMode');
    },

    val: function () {
      return this.collection.map(function (model) {
        return _.omit(model.toJSON({verbose: true}), '__edit__', '__destroyable__');
      });
    },

    focus: function () {
      this.listView && this.listView.focus();
    }
  }, { // test hooks
    ItemView: ItemView,
    InputListView: InputListView,
    AddNewItemButton: AddNewItemButton,
    RemoveItemButton: RemoveItemButton,
    DragDropGripper: DragDropGripper
  });
});
