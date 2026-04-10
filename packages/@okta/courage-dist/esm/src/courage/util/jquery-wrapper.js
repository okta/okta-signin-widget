import $ from 'jquery';
import { getOidcRequestHeaders } from './OrchestratorProvider.js';
import { AuthorizationHeaderTypes as Rn } from '../../../node_modules/@okta/ui-libraries-oidc-auth-headers/dist/index.js';
import { OktaPageData } from '../../../node_modules/@okta/ui-libraries-monolith/dist/esm/OktaPageData.js';
import '../../../node_modules/@okta/ui-libraries-monolith/dist/esm/ServerStatus.js';
import Logger from './Logger.js';

/* eslint-disable @okta/okta-ui/enforce-requirejs-names, @okta/okta-ui/no-specific-modules */
var PageDataEnum;

(function (PageDataEnum) {
  PageDataEnum[PageDataEnum["isJqueryOidcEnabled"] = 0] = "isJqueryOidcEnabled";
})(PageDataEnum || (PageDataEnum = {}));

const PAGE_DATA_NAMESPACE = '@okta/dll-common';
const pageData = new OktaPageData(PAGE_DATA_NAMESPACE, PageDataEnum);
// keep a handle on the original ajax object so we can call it when the async call to 
// getOidcRequestHeaders resolves
const originalAjax = $.ajax;

$.ajax = function (url, options) {
  // If the feature flag is not enabled, just call the original ajax method
  // Expectation is that we will remove this code path in the future if this fallback isn't needed anymore
  const isJqueryOidcEnabled = pageData.get(PageDataEnum.isJqueryOidcEnabled) || false;

  if (!isJqueryOidcEnabled) {
    // If the feature flag is not enabled, just call the original ajax method
    return originalAjax.call($, url, options);
  } // default values


  let isAsync = true;
  let originalUrl = url;
  let scopes = [];
  let authParams;
  let httpMethod = 'GET'; // Default to GET if not specified
  // the jquery ajax API allows for the first parameter to be a string (url) or object, so we need
  // to handle it accordingly to get the right params we need out of the parameters

  if (url && typeof url === 'object' && options === undefined) {
    isAsync = url.async !== undefined ? url.async : isAsync;
    originalUrl = url.url; // url.type is the http method in legacy versions of jquery, url.method in modern versions

    httpMethod = url.type || url.method || httpMethod;
    scopes = url.scopes || scopes;
    authParams = url.authParams || authParams;
  } else if (options && typeof options === 'object') {
    if (typeof url !== 'string' && options.url) {
      originalUrl = options.url;
    }

    isAsync = options.async !== undefined ? options.async : isAsync; // options.type is the http method in legacy versions of jquery, options.method in modern versions

    httpMethod = options.type || options.method || httpMethod;
    scopes = options.scopes || scopes;
    authParams = options.authParams || authParams;
  } // If the request is not async or there are no scopes, just call the original ajax
  // If the request is async and there are scopes, we need to fetch the OIDC request headers first
  // before calling the original ajax method
  // We cannot fetch OIDC request headers for synchronous requests, so if the request is synchronous
  // and there are scopes, we will log a warning
  // If there are no scopes, we will log a warning and proceed without the headers


  if (isAsync === false || scopes.length === 0) {
    if (scopes.length === 0) {
      Logger.warn('No scopes provided for OIDC request headers. Proceeding without Authorization headers.');
    }

    if (isAsync === false) {
      if (scopes.length > 0) {
        // eslint-disable-next-line max-len
        Logger.warn('Cannot fetch OIDC request headers for synchronous requests. Please make the request asynchronous (async: true) to use OIDC scopes.');
      } // eslint-disable-next-line max-len


      Logger.warn('Cannot fetch OIDC request headers for synchronous requests. Proceeding without Authorization headers.');
    } // If the request is not async or there are no scopes, just call the original ajax


    return originalAjax.call($, url, options);
  }

  const deferred = $.Deferred(); // We need to return a jqXHR object, which is a superset of a Promise
  // We can achieve this by creating a Deferred object and returning it as a jqXHR
  // However, we need to make sure to call the resolve/reject methods of the Deferred
  // object when the original jqXHR object resolves/rejects
  // We also need to handle the abort method, which is not part of the Promise interface
  // so we will create a proxy abort method that will call the abort method of the original
  // jqXHR object when it is available
  // We also need to handle the case where the abort method is called before the original
  // jqXHR object is created, so we will set a flag and check it after the original
  // jqXHR object is created

  let realJqXHR = null;
  let abortRequested = false; // Attach abort immediately

  deferred.abort = function () {
    abortRequested = true;

    if (realJqXHR && typeof realJqXHR.abort === 'function') {
      realJqXHR.abort();
    } else {
      // If abort is called before realJqXHR exists, reject with 'abort'
      deferred.reject(null, 'abort');
    }
  }; // Perform async logic before jquery ajax


  getOidcRequestHeaders(scopes, originalUrl, httpMethod, authParams).then(authHeaders => {
    const additionalHeaders = {};

    for (const key in authHeaders) {
      // The enum has the header names as lowercase. It doesn't matter what case we use for setting the header
      // (the next line), but we want to properly match against the enum, so use `key.toLowerCase()`.
      if (Object.hasOwn(Rn, key.toLowerCase())) {
        additionalHeaders[key] = authHeaders[key];
      }
    }

    if (options) {
      options.headers = { ...(options.headers || {}),
        ...additionalHeaders
      };
    } else if (typeof url === 'object') {
      url.headers = { ...(url.headers || {}),
        ...additionalHeaders
      };
    } // Call the original $.ajax method with the updated options
    // and return its jqXHR object


    realJqXHR = typeof url === 'object' && options === undefined ? originalAjax.call($, url) : originalAjax.call($, url, options); // Proxy abort

    deferred.abort = function () {
      if (realJqXHR && typeof realJqXHR.abort === 'function') {
        realJqXHR.abort();
      }
    }; // If abort was requested before realJqXHR was created, abort now


    if (abortRequested && typeof realJqXHR.abort === 'function') {
      realJqXHR.abort();
    } // Pipe the original jqXHR object to our deferred object
    // This links the new deferred's state to the original jqXHR's state


    realJqXHR.pipe(deferred.resolve, deferred.reject);
  }).catch(err => {
    deferred.reject(null, 'Failed to fetch OIDC request headers', err);

    if (options && typeof options.error === 'function') {
      options.error(null, 'Failed to fetch OIDC request headers', err);
    }
  }); // Return the jqXHR-like promise immediately

  return deferred;
};

$.ajaxSetup({
  beforeSend: function (xhr) {
    xhr.setRequestHeader('X-Okta-XsrfToken', $('#_xsrfToken').text());
  },
  converters: {
    'text secureJSON': function (str) {
      if (str.substring(0, 11) === 'while(1){};') {
        str = str.substring(11);
      }

      return JSON.parse(str);
    }
  }
}); // Selenium Hook
// Widget such as autocomplete and autosuggest needs to be triggered from the running version of jQuery.
// We have 2 versions of jQuery running in parallel and they don't share the same events bus

const oktaJQueryStatic = $;
window.jQueryCourage = oktaJQueryStatic;

export { oktaJQueryStatic as default };
