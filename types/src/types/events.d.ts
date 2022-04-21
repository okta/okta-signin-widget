import { ErrorXHR } from './errors';
export declare type EventName = 'ready' | 'afterError' | 'afterRender';
export interface EventContext {
    controller: string;
    formName?: string;
    authenticatorKey?: string;
    methodType?: string;
}
export interface EventErrorContext {
    xhr?: ErrorXHR;
    name?: string;
    message?: string;
    statusCode?: number;
    errorSummary?: string;
}
export interface EventData {
    page: string;
}
export declare type EventCallback = (context: EventContext, error?: EventErrorContext) => void;
export declare type EventCallbackWithError = (context: EventContext, error: EventErrorContext) => void;
//# sourceMappingURL=events.d.ts.map