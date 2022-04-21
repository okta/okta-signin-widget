/**
 * Validate the request token and prepare for the iframe to become ready.
 *
 * All options below can be passed into an options hash to `Duo.init`, or
 * specified on the iframe using `data-` attributes.
 *
 * Options specified using the options hash will take precedence over
 * `data-` attributes.
 *
 * Example using options hash:
 * ```javascript
 * Duo.init({
 *     iframe: "some_other_id",
 *     host: "api-main.duo.test",
 *     sig_request: "...",
 *     post_action: "/auth",
 *     post_argument: "resp"
 * });
 * ```
 *
 * Example using `data-` attributes:
 * ```html
 * <iframe id="duo_iframe"
 *         data-host="api-main.duo.test"
 *         data-sig-request="..."
 *         data-post-action="/auth"
 *         data-post-argument="resp"
 *         >
 * </iframe>
 * ```
 *
 * Some browsers (especially embedded browsers) don't like it when the Duo
 * Web SDK changes the `src` attribute on the iframe. To prevent this, there
 * is an alternative way to use the Duo Web SDK:
 *
 * Add a div (or any other container element) instead of an iframe to the
 * DOM with an id of "duo_iframe", or pass that element to the
 * `iframeContainer` parameter of `Duo.init`. An iframe will be created and
 * inserted into that container element, preventing `src` change related
 * bugs. WARNING: All other elements in the container will be deleted.
 *
 * The `iframeAttributes` parameter of `Duo.init` is available to set any
 * attributes on the inserted iframe if the Duo Web SDK is inserting the
 * iframe. For details, see the parameter documentation below.
 *
 * @param {Object} options
 * @param {String} options.host - Hostname for the Duo Prompt.
 * @param {String} options.sig_request - Request token.
 * @param {String|HTMLElement} [options.iframe] - The iframe, or id of an
 *     iframe that will be used for the Duo Prompt. If you don't provide
 *     this or the `iframeContainer` parameter the Duo Web SDK will default
 *     to using whatever element has an id of "duo_iframe".
 * @param {String|HTMLElement} [options.iframeContainer] - The element you
 *     want the Duo Prompt inserted into, or the id of that element.
 *     Anything inside this element will be deleted and replaced with an
 *     iframe hosting the Duo prompt. If you don't provide this or the
 *     `iframe` parameter the Duo Web SDK will default to using whatever
 *     element has an id of "duo_iframe".
 * @param {Object} [options.iframeAttributes] - Object with  names and
 *     values coresponding to attributes you want added to the  Duo Prompt
 *     iframe, like `title`, `width` and `allow`. WARNING: this parameter
 *     only works if you use the `iframeContainer` parameter or add an id
 *     of "duo_iframe" to an element that isn't an iframe. If you have
 *     added an iframe to the DOM yourself, you should set those attributes
 *     directly on the iframe.
 * @param {String} [options.post_action=''] - URL to POST back to after a
 *     successful auth.
 * @param {String} [options.post_argument='sig_response'] - Parameter name
 *     to use for response token.
 * @param {Function} [options.submit_callback] - If provided, the Duo Web
 *     SDK will not submit the form. Instead it will execute this callback
 *     function passing in a reference to the "duo_form" form object.
 *     `submit_callback`` can be used to prevent the webpage from reloading.
 */
export function init(options: {
    host: string;
    sig_request: string;
    iframe?: string | HTMLElement;
    iframeContainer?: string | HTMLElement;
    iframeAttributes?: any;
    post_action?: string;
    post_argument?: string;
    submit_callback?: Function;
}): void;
declare function onReady(callback: any): void;
/**
 * Parse the sig_request parameter, throwing errors if the token contains
 * a server error or if the token is invalid.
 *
 * @param {String} sig Request token
 */
declare function parseSigRequest(sig: string): {
    sigRequest: string;
    duoSig: string;
    appSig: string;
};
/**
 * Validate that a MessageEvent came from the Duo service, and that it
 * is a properly formatted payload.
 *
 * The Google Chrome sign-in page injects some JS into pages that also
 * make use of postMessage, so we need to do additional validation above
 * and beyond the origin.
 *
 * @param {MessageEvent} event Message received via postMessage
 */
declare function isDuoMessage(event: MessageEvent): boolean;
/**
 * We received a postMessage from Duo.  POST back to the primary service
 * with the response token, and any additional user-supplied parameters
 * given in form#duo_form.
 */
declare function doPostBack(response: any): void;
export { onReady as _onReady, parseSigRequest as _parseSigRequest, isDuoMessage as _isDuoMessage, doPostBack as _doPostBack };
//# sourceMappingURL=index.d.ts.map