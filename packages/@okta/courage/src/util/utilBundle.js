/* eslint max-params: [2, 27] */
define([
  './BaseController',
  './BaseRouter',
  './BatchAjaxUtil',
  './ButtonFactory',
  './Class',
  './Clipboard',
  './Cookie',
  './DataListController',
  './ErrorParser',
  './Events',
  './formatXml',
  './Fx',
  './Keys',
  './Logger',
  './Metrics',
  './NumberUtil',
  './SchemaUtil',
  './SettingsModel',
  './StateMachine',
  './StringUtil',
  './TabbedRouter',
  './TemplateUtil',
  './Time',
  './TimeUtil',
  './TimezoneUtil',
  './Util',
  './ViewUtil'
],
function (BaseController, BaseRouter, BatchAjaxUtil, ButtonFactory, Class, Clipboard, Cookie, 
  DataListController, ErrorParser, Events, formatXml, Fx, Keys, Logger, Metrics, NumberUtil, SchemaUtil, SettingsModel,
  StateMachine, StringUtil, TabbedRouter, TemplateUtil, Time, TimeUtil, TimezoneUtil, Util, ViewUtil) {

  return {

    BaseController: BaseController,

    BaseRouter: BaseRouter,

    BatchAjaxUtil: BatchAjaxUtil,

    ButtonFactory: ButtonFactory,

    Class: Class,

    Clipboard: Clipboard,

    Cookie: Cookie,

    DataListController: DataListController,

    ErrorParser: ErrorParser,

    Events: Events,

    formatXml: formatXml,

    Fx: Fx,

    Keys: Keys,

    Logger: Logger,

    Metrics: Metrics,

    NumberUtil: NumberUtil,

    SchemaUtil: SchemaUtil,

    SettingsModel: SettingsModel,

    StateMachine: StateMachine,

    StringUtil: StringUtil,

    TabbedRouter: TabbedRouter,

    TemplateUtil: TemplateUtil,

    Time: Time,

    TimeUtil: TimeUtil,

    TimezoneUtil: TimezoneUtil,

    Util: Util,

    ViewUtil: ViewUtil

  };

});
