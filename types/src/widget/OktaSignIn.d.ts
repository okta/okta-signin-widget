import V1Router from "../LoginRouter";
import V2Router from "../v2/WidgetRouter";
import Hooks from "../models/Hooks";
import { WidgetOptions, OktaSignInAPI, RenderSuccessCallback, RenderErrorCallback, RenderResult, RenderOptions, HookFunction, EventCallback, EventCallbackWithError, EventName } from '../types';
import { OktaAuth, Tokens } from '@okta/okta-auth-js';
declare type AbstractRouter = typeof V1Router | typeof V2Router;
export default class OktaSignIn implements OktaSignInAPI {
    Router: AbstractRouter;
    options: WidgetOptions;
    hooks: Hooks;
    router: AbstractRouter;
    authClient: OktaAuth;
    constructor(options: WidgetOptions);
    /**
     * Render the sign in widget to an element. Returns a promise that will resolve on success or reject on error.
     * @param options - options for the signin widget.
     *        Must have an el or $el property to render the widget to.
     * @param success - success callback function
     * @param error - error callback function
     */
    renderEl(renderOptions: RenderOptions, successFn?: RenderSuccessCallback, errorFn?: RenderErrorCallback): Promise<RenderResult>;
    hide(): void;
    show(): void;
    remove(): void;
    /**
     * Renders the Widget and returns a promise that resolves to OAuth tokens
     * @param options - options for the signin widget
     */
    showSignInToGetTokens(options?: RenderOptions): Promise<Tokens>;
    /**
     * Renders the widget and redirects to the OAuth callback
     * @param options - options for the signin widget
     */
    showSignInAndRedirect(options?: RenderOptions): Promise<void>;
    /**
     * Renders the widget. Either resolves the returned promise, or redirects.
     * @param options - options for the signin widget
     */
    showSignIn(options?: RenderOptions): Promise<RenderResult>;
    before(formName: string, callbackFn: HookFunction): void;
    after(formName: string, callbackFn: HookFunction): void;
    getUser(): any;
    on(event: EventName, callback: EventCallback | EventCallbackWithError): void;
    off(event?: EventName, callback?: EventCallback | EventCallbackWithError): void;
    once(event: EventName, callback: EventCallback): void;
    stopListening(event?: EventName, callback?: EventCallback): void;
    listenTo(object: any, event: EventName, callback: EventCallback): void;
    trigger(event: EventName, ...args: any[]): void;
}
export {};
//# sourceMappingURL=OktaSignIn.d.ts.map