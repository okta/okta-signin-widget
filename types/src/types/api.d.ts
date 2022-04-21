import { OktaAuthInterface, Tokens } from '@okta/okta-auth-js';
import { RenderOptions, WidgetOptions } from './options';
import { EventCallback, EventCallbackWithError } from './events';
import { RenderError, RenderResult } from './results';
export interface HooksAPI {
    before(eventName: any, hookFn: any): void;
    after(eventName: any, hookFn: any): void;
}
export interface RouterEventsAPI {
    on(event: 'ready', callback: EventCallback): void;
    on(event: 'afterError', callback: EventCallbackWithError): void;
    on(event: 'afterRender', callback: EventCallback): void;
    off(event?: 'ready', callback?: EventCallback): void;
    off(event?: 'afterError', callback?: EventCallbackWithError): void;
    off(event?: 'afterRender', callback?: EventCallback): void;
}
export declare type RenderSuccessCallback = (res: RenderResult) => void;
export declare type RenderErrorCallback = (err: RenderError) => void;
export interface OktaSignInAPI extends HooksAPI, RouterEventsAPI {
    authClient: OktaAuthInterface;
    show(): void;
    hide(): void;
    remove(): void;
    showSignIn(options: any): Promise<RenderResult>;
    showSignInToGetTokens(options: RenderOptions): Promise<Tokens>;
    showSignInAndRedirect(options: RenderOptions): Promise<void>;
    renderEl(options: RenderOptions, success?: RenderSuccessCallback, error?: RenderErrorCallback): Promise<RenderResult>;
    getUser(): void;
}
export interface OktaSignInConstructor {
    new (options: WidgetOptions): OktaSignInAPI;
}
//# sourceMappingURL=api.d.ts.map