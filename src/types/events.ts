import { ErrorXHR } from './errors';

// Events
export type EventName =
  'ready' |
  'afterError' |
  'afterRender';

export interface EventContext {
  controller: string;
  formName?: string;
  authenticatorKey?: string;
  methodType?: string;
}

export interface EventErrorContext {
  xhr?: ErrorXHR;

  // Classic
  name?: string;
  message?: string;
  statusCode?: number;

  // OIE
  errorSummary?: string
}

export interface EventData {
  page: string;
}

export type EventCallback = (context: EventContext, error?: EventErrorContext) => void;
export type EventCallbackWithError = (context: EventContext, error: EventErrorContext) => void;
