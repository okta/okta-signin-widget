define([
  'okta/underscore',
  'shared/util/TemplateUtil',
  './BaseSelect',
  'shared/util/StringUtil',
  'vendor/plugins/select2'
],
function (_, TemplateUtil, BaseSelect, StringUtil, select2) {

  var selectOptionTemplate = TemplateUtil.tpl('\
    <div class="clearfix">\
      <span class="link-button link-button-small">\
        {{i18n code="oform.groupselect.add" bundle="messages"}}\
      </span>\
      <div class="group-medium-app-logo-wrapper"><img class="app-logo" src="{{mediumIconUrl}}"/></div>\
      <div class="group-desc">\
        <h3 class="group-desc-header">{{{highlightedName}}}</h3>\
        <span class="group-desc-info">{{#if appGroup}}{{appGroup}} &#183; {{/if}}\
        {{#if description}}\
          {{description}}\
        {{else}}\
          {{i18n code="oform.groupselect.no_description" bundle="messages"}}\
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

  var selectionTemplate = TemplateUtil.tpl('\
    <div>\
      <span class="group-small-app-logo-wrapper">\
        <img class="logo" src="{{smallIconUrl}}"/>\
      </span>\
      <span class="select2-chosen-text">{{name}}</span>\
    </div>\
  ');

  var readModeTemplate = TemplateUtil.tpl('\
      {{#if smallIconUrl}}\
      <span class="group-small-app-logo-wrapper">\
        <img class="logo" src="{{smallIconUrl}}"/>\
      </span>\
      {{/if}}\
      <span class="select2-chosen-text">{{name}}</span>\
  ');

  return BaseSelect.extend({
    className: 'group-select-wrap',
    apiURL: '/api/v1/groups',
    extraParams: {
      expand: 'stats,app',
      limit: 10
    },
    placeholder: StringUtil.localize('oform.groupselect.placeholder', 'messages'),
    formatInputTooShort: StringUtil.localize('oform.groupselect.short_input', 'messages'),

    /**
    * @Override
    */
    toStringValue: function () {
      return readModeTemplate(this._entity);
    },

    formatSelection: function (group) {
      if (group.empty) {
        return group.name;
      }
      return selectionTemplate(group);
    },

    formatResult: function (group, $el, query, escapeMarkup) {
      if (group.empty) {
        return this.selectEmptyOptionTemplate();
      }
      if (group.disabled) {
        $el.addClass('search-info-msg');
        return this.searchInfoMsgTemplate(group);
      }
      var markup = [];
      select2.util.markMatch(group.name, query.term, markup, escapeMarkup);
      group.highlightedName = markup.join('');
      return selectOptionTemplate(group);
    },

    parse: function (group) {
      var newGroup = _.extend({}, group, group.profile, group._embedded.stats, {
        smallIconUrl: _.findWhere(group._links.logo, {name: 'medium'}).href,
        mediumIconUrl: _.findWhere(group._links.logo, {name: 'medium'}).href,
        name: group.profile.name,
        appGroup: group._embedded.app && group._embedded.app.label
      });
      return _.pick(newGroup, 'id', 'name', 'description', 'smallIconUrl', 'mediumIconUrl',
        'usersCount', 'appsCount', 'groupPushMappingsCount', 'appGroup');
    }

  });
});
