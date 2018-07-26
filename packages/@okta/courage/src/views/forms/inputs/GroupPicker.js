define([
  'okta/underscore',
  'shared/util/TemplateUtil',
  './BasePicker'
],
function (_, TemplateUtil, BasePicker) {

  var autoSuggestTemplate = TemplateUtil.tpl('\
    <div class="group-result-template">\
      <span class="link-button link-button-small">Add</span>\
      <div class="group-medium-app-logo-wrapper"><img class="app-logo" src="{{mediumIconUrl}}"/></div>\
      <div class="group-desc">\
        <h3 class="group-desc-header">{{{name}}}</h3>\
        <span class="group-desc-info">{{#if appGroup}}{{appGroup}} &#183; {{/if}}\
        {{#if description}}\
          {{description}}\
        {{else}}\
          {{i18n code="oform.groupselect.no_description" bundle="courage"}}\
        {{/if}}</span>\
        <ul class="group-desc-stats">\
          <li class="icon-16"><span class="icon person-16-gray"></span>{{usersCount}}</li>\
          <li class="icon-16"><span class="icon app-16-gray"></span>{{appsCount}}</li>\
          {{#if groupPushMappingsCount}}\
            <li class="icon-16">\
              <span class="icon inactive-sync-16"></span>{{groupPushMappingsCount}} apps\
            </li>\
          {{/if}}\
        </ul>\
      </div>\
    </div>\
  ');

  var prependTemplate = TemplateUtil.tpl('\
    <span class="group-small-app-logo-wrapper">\
      <img class="logo" src="{{smallIconUrl}}"/>\
    </span>\
  ');

  var readModeTemplate = TemplateUtil.tpl('\
    <ul class="as-selections">\
    {{#each groups}}\
      <li class="as-selection-item">\
        <span class="group-small-app-logo-wrapper">\
          <img style="width:16px; height:16px;" class="logo" src="{{smallIconUrl}}">\
        </span>\
        {{{name}}}\
      </li>\
    {{/each}}\
    <li class="as-selection-item" style="display: none"></li>\
    </ul>\
  ');

  return BasePicker.extend({

    className: 'group-picker-wrap',
    apiURL: '/api/v1/groups',
    extraParams: {
      expand: 'stats,app'
    },
    appendExtraParamsInPrefetch: false,

    /**
     * extra customized footer element that will be append after the result list.
     * expect an string representing HTML fragment.
     *
     * @type {String}
     */
    footer: null,

    escapeEntities: false,

    prependTemplate: prependTemplate,
    autoSuggestTemplate: autoSuggestTemplate,
    readModeTemplate: readModeTemplate,

    constructor: function () {
      BasePicker.apply(this, arguments);
      if (this.getParam('filter')) {
        this.extraParams = _.extend({}, this.extraParams, {
          filter: this.getParam('filter')
        });
      }
      this.keepEmpty = this.getParam('keepEmpty');
    },

    /**
    * @Override
    */
    toStringValue: function () {
      return this.readModeTemplate({groups: this._entities});
    },

    parse: function (group) {
      var newGroup = _.extend({}, group, group.profile, {
        smallIconUrl: _.findWhere(group._links.logo, {name: 'medium'}).href,
        mediumIconUrl: _.findWhere(group._links.logo, {name: 'medium'}).href,
        name: this.escape(group.profile.name)
      });
      if (group._embedded) {
        _.extend(newGroup, group._embedded.stats, {
          appGroup: group._embedded.app && group._embedded.app.label
        });
      }
      return _.pick(newGroup, 'id', 'name', 'description', 'smallIconUrl', 'mediumIconUrl',
                              'usersCount', 'appsCount', 'groupPushMappingsCount', 'appGroup', 'mfaPolicy');
    },

    formatList: function (group, $el) {
      return $el.html(this.autoSuggestTemplate(group));
    },

    resultsComplete: function () {
      BasePicker.prototype.resultsComplete.apply(this, arguments);

      var footer = this.getAttribute('footer');
      if (_.isString(footer)) {
        this.$('.as-results .as-list').append(footer);
      }
    },

    addEntity: function ($el, flatGroup) {
      $el.prepend(this.prependTemplate(flatGroup));
      BasePicker.prototype.addEntity.apply(this, arguments);
      if (this.keepEmpty) {
        // when keepEmpty is true, we need to clear picker immediately,
        // so we remove selected items. Also we remove all selected values from
        // valuesInput input element and set it's value to "," in order to let autosuggest plugin show placeholder.
        this.getValuesInput().val(',');
        this.removeEntity($el);
      }
    }

  });

});
