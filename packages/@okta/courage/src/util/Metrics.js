/* eslint max-len:0, max-statements:0, complexity:0, max-params: [2, 6]*/
define([
  'okta/jquery',
  'okta/underscore',
  'mixpanel-browser',
  './Class',
  './Logger',
  './TemplateUtil'
],
function ($, _, mixpanel, Class, Logger, TemplateUtil) {

  // Project: okta-dev
  var DEV_TOKEN = 'ed04ba7b43abbdfbc578c5402f86a03e';

  // Project: okta-prod
  var PROD_TOKEN = '73623d035cdabf11e9cfd7580c6d5a97';

  var LOG_STYLE = 'background-color:#f10; color:#fff; padding:2px';

  function log(method) {
    var args = ['%cmixpanel:' + method, LOG_STYLE].concat(_.rest(arguments));
    Logger.log.apply(Logger, args);
  }

  /**
   * @class Okta.Metrics
   * @abstract
   *
   * Abstract class that initializes the global mixpanel object, enforces
   * component and flow properties, and handles behavior in development vs.
   * production.
   *
   * Example class that extends Metrics:
   *
   * ```javascript
   * var EVENT_DISMISSED = 'AdminBanner Dismissed',
   *     EVENT_VIEWED    = 'AdminBanner Viewed';
   *
   * var AdminBannerFlow = Okta.Metrics.extend({
   *
   *   component: 'ADMIN',
   *
   *   name: 'AdminBanner',
   *
   *   // Note: It is up to the developer to follow the naming conventions for
   *   // these functions, i.e. "track{{eventName}}" and "time{{eventName}}".
   *
   *   trackView: function () {
   *     return this.track(EVENT_VIEWED);
   *   },
   *
   *   timeDismiss: function () {
   *     this.timeEvent(EVENT_DISMISSED);
   *   },
   *
   *   trackDismiss: function () {
   *     return this.track(EVENT_DISMISSED);
   *   }
   *
   * });
   * ```
   */
  return Class.extend({

    /**
    * Component that is being tracked. This is sent on every track event, and
    * is used as a filter when creating funnels.
    *
    * @type {String} component (required)
    * @abstract
    */
    component: undefined,

    /**
    * Name of the flow. This is also sent on every track event, and is an
    * additional filter when creating funnels.
    *
    * @type {String} name (required)
    * @abstract
    */
    name: undefined,

    /**
     * @param {Object} [options]
     * @param {Boolean} [options.sendEventsInDev=false]
     *   Send events to the okta-dev mixpanel project. By default, events in
     *   dev are logged to the console. If true, will actually send the events.
     *   Only enable this in dev.
     */
    initialize: function (options) {
      options || (options = {});

      if (!this.component) {
        throw new Error('Must define metrics component');
      }
      if (!this.name) {
        throw new Error('Must define metrics name');
      }

      var isProd = this.isProduction(),
          token = isProd ? PROD_TOKEN : DEV_TOKEN,
          superProperties = this.getSuperProperties(),
          distinctId = this.getDistinctId(),
          trakingEnabled = window.okta ? window.okta.mixpanel !== false : true;

      mixpanel.init(token, {}, this.name);
      this.__instance = mixpanel[this.name];
      this.__instance.register(superProperties);
      this.__instance.identify(distinctId);
      this.__sendMixpanelEvents = trakingEnabled && (isProd || options.sendEventsInDev);

      if (!this.__sendMixpanelEvents) {
        log('init', {
          distinctId: distinctId,
          isProd: isProd,
          superProperties: superProperties
        });
      }
    },

    /**
     * Returns true if in a production environment (preview or production).
     * Override if there is different logic for determining when to use the
     * okta-prod vs. okta-dev mixpanel token.
     *
     * @return {Boolean} true if in production
     */
    isProduction: function () {
      var env = this.getDeployEnvironment();
      return env === 'PREVIEW' || env === 'PROD';
    },

    /**
     * Returns the distinctId, which is normally the userId. Override if the
     * page does not write the userId to the \#analytics-uid element.
     *
     * @return {String} distinctId
     */
    getDistinctId: function () {
      return $('#analytics-uid').text();
    },

    /**
     * Returns the deployEnvironment, which can be DEV, PREVIEW, or PROD.
     * Override if the page does not write the deployEnvironment to the
     * \#analytics-env element.
     *
     * @return {String} env
     */
    getDeployEnvironment: function () {
      return $('#analytics-env').text() || 'DEV';
    },

    /**
     * Returns a map of [superProperties](https://mixpanel.com/docs/properties-or-segments/how-do-i-set-a-property-every-time)
     * to store with each event. Override if tracking a different set than the
     * defaults listed here.
     *
     * @return {Object} map of super properties to register on initialize
     */
    getSuperProperties: function () {
      return {
        env: this.getDeployEnvironment()
      };
    },

    /**
     * Returns a map of default properties to send with every event. Override
     * if customizing the defaults listed here.
     *
     * @return {Object} map of default properties to send with each event
     */
    getDefaultProperties: function () {
      return {
        metricsComponent: this.component,
        metricsName: this.name
      };
    },

    /*
     * Returns eventNames prefixed with component and flow name, i.e.
     * Courage:Test Mixpanel:button clicked
     *
     * @return {String} prefixed event name.
     */
    getFullEventName: function (eventName) {
      var defaultProperties = this.getDefaultProperties();
      return TemplateUtil.tpl('{{metricsComponent}}:{{metricsName}}:{{eventName}}')({
        metricsComponent: defaultProperties.metricsComponent,
        metricsName: defaultProperties.metricsName,
        eventName: eventName
      });
    },

    /**
     * Mixpanel **[track](https://mixpanel.com/help/reference/javascript-full-api-reference#mixpanel.track)** function.
     *
     * Logs to console if dev and sendEventsInDev is false. The main difference
     * between this method and the original mixpanel function is that this
     * returns a [promise](http://api.jquery.com/deferred.promise/) instead of
     * accepting a callback function.
     *
     * @param eventName {String} (required)
     *   The name of the event.
     * @param properties {Object}
     *   A set of properties to include with the event you're sending. By default,
     *   flowComponent and flowName are set.
     *
     * @return {Object}
     *   [Promise](http://api.jquery.com/deferred.promise/) that is resolved
     *   when the mixpanel request is done.
     */
    track: function (eventName, properties) {
      var propertiesToSend = _.extend(this.getDefaultProperties(), properties),
          deferred = $.Deferred(),
          fullEventName = this.getFullEventName(eventName);

      if (this.__sendMixpanelEvents) {
        this.__instance.track(fullEventName, propertiesToSend, function () {
          deferred.resolve();
        });
      }
      else {
        // warn if length is 30 or 46(in some cases) max as it would be truncated in mixpanel UI.
        if (fullEventName.length > 30) {
          Logger.warn('Prefixed event name is too long (>30):' + fullEventName);
        }
        log('track', fullEventName, propertiesToSend);
        _.defer(deferred.resolve);
      }

      return deferred.promise();
    },

    /**
     * Mixpanel **[time_event](https://mixpanel.com/help/reference/javascript-full-api-reference#mixpanel.time_event)** function.
     *
     * Logs to console if dev and sendEventsInDev is false.
     *
     * @param eventName {String} (required)
     *   The name of the event.
     */
    timeEvent: function (eventName) {
      // The eventName should be consistent with the event name that is sent in track function.
      if (this.__sendMixpanelEvents) {
        this.__instance.time_event(this.getFullEventName(eventName));
      }
      else {
        log('time_event', this.getFullEventName(eventName));
      }
    }

  });

});
