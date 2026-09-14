/*
 * Copyright (c) 2024-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/**
 * Feedback diagnostics collector (gen3 only).
 *
 * Accumulates a per-transaction trail of the IDX flow the widget goes through.
 * When the user hits an unrecoverable terminal error and clicks "Send feedback",
 * {@link buildDiagnosticBundle} assembles the trail plus environment metadata
 * into a bundle that is shipped to Sentry (see `sentryFeedback.ts`).
 *
 * Each entry in `transactions[]` groups everything known about one request:
 * the actual request URL (incl. `/idp/idx/introspect`) + method + HTTP status
 * from a minimal fetch tap, the resolved step/idx-status, message keys, and —
 * when `feedback.includeRawResponses` is on — the full raw response body.
 *
 * Deliberate constraints:
 * - The fetch tap records ONLY url + method + status. Never request/response
 *   bodies, headers, or the `x-okta-request-id` (server correlation is out of
 *   scope for this round).
 * - Raw response bodies (opt-in) are PII/secret-bearing (contain `stateHandle`,
 *   identifier, etc.) — attachment-only, and MUST be scrubbed before production.
 * - The trail persists to `sessionStorage` so it survives same-tab redirects.
 * - Consecutive identical (poll) steps collapse into one entry with a `count`.
 *
 * See `src/v3/docs/terminal-feedback-diagnostics.md`, incl. why a true HAR
 * cannot be produced from page JS.
 */
import { IdxTransaction } from '@okta/okta-auth-js';

import { IWidgetContext, WidgetProps } from '../types';
import { getEventContext } from './getEventContext';
import { getUserInfo } from './idxUtils';
import { getBaseUrl } from './settingsUtils';

const SESSION_KEY = 'osw-feedback-diagnostics';
const MAX_RECORDS = 30;
const IDX_URL_FRAGMENT = '/idp/idx/';

export interface TransactionRecord {
  /** 0-based order in the flow */
  seq: number;
  /** epoch millis when this transaction became current */
  ts: number;
  /** resolved form/step name (e.g. 'identify', 'challenge-authenticator', 'terminal') */
  step: string;
  /** the actual request URL that produced this response (from the fetch tap) —
   *  this is how `/idp/idx/introspect` and the real per-step URLs are captured */
  requestUrl?: string;
  method?: string;
  httpStatus?: number;
  /** IDX-level status */
  idxStatus?: string;
  requestDidSucceed?: boolean;
  /** i18n keys of any messages (keys, not raw text) */
  messageKeys?: string[];
  authenticatorKey?: string;
  /** consecutive identical steps collapsed (e.g. polling) */
  count?: number;
  /** request payload the client SENT for this step — present only when
   *  includeRawResponses is on. HIGHLY sensitive (credentials/OTP live here);
   *  attachment-only, must be scrubbed before prod */
  requestBody?: unknown;
  /** full raw response — present only when includeRawResponses is on; the Sentry
   *  sender keeps this in the attachment and strips it from the indexed context */
  rawResponse?: unknown;
}

export interface SiwDiagnosticBundle {
  capturedAt: number;
  widget: { version: string; commit: string; engine: 'gen3' };
  flow: {
    type?: string;
    formName?: string;
    controller?: string | null;
    authenticatorKey?: string;
    methodType?: string;
  };
  error: {
    messages: Array<{ i18nKey?: string; class?: string; message?: string }>;
  };
  /** the per-transaction trail — one grouped entry per request */
  transactions: TransactionRecord[];
  environment: {
    userAgent?: string;
    language?: string;
    languages?: string[];
    platform?: string;
    viewport?: { width?: number; height?: number };
    online?: boolean;
    cookieEnabled?: boolean;
  };
  config: {
    issuerOrigin?: string;
    clientId?: string;
  };
  user?: { identifier?: string };
}

// ---- module state (per page-load; rehydrated from sessionStorage) ----
let transactions: TransactionRecord[] = [];
let lastRequest: { url?: string; method?: string; httpStatus?: number; body?: unknown } = {};
let hydrated = false;
let fetchTapInstalled = false;

/** Parse a fetch request body (JSON string / FormData / URLSearchParams) for diagnostics. */
const parseRequestBody = (init?: RequestInit): unknown => {
  const body = init?.body;
  if (!body) {
    return undefined;
  }
  // URLSearchParams or FormData
  if (typeof (body as FormData)?.forEach === 'function') {
    const data: Record<string, string> = {};
    (body as FormData).forEach((v, k) => {
      if (typeof v === 'string') {
        data[k] = v;
      }
    });
    return data;
  }
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }
  return String(body);
};

const safeGetSession = (): Storage | undefined => {
  try {
    return window?.sessionStorage;
  } catch {
    return undefined;
  }
};

const persist = (): void => {
  const store = safeGetSession();
  if (!store) {
    return;
  }
  try {
    store.setItem(SESSION_KEY, JSON.stringify({ transactions }));
  } catch {
    // Raw responses can be large; if persisting fails (quota), retry without
    // them so at least the lean trail survives redirects.
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const lean = transactions.map(({ rawResponse, requestBody, ...t }) => t);
      store.setItem(SESSION_KEY, JSON.stringify({ transactions: lean }));
    } catch {
      // give up — best effort only
    }
  }
};

const hydrateOnce = (): void => {
  if (hydrated) {
    return;
  }
  hydrated = true;
  const store = safeGetSession();
  if (!store) {
    return;
  }
  try {
    const raw = store.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      transactions = Array.isArray(parsed?.transactions) ? parsed.transactions : [];
    }
  } catch {
    transactions = [];
  }
};

const getMessages = (txn: IdxTransaction) => txn.messages ?? [];

/**
 * Install a minimal `window.fetch` tap that records the URL + method + HTTP
 * status of each IDX request (so the actual request URL, including
 * `/idp/idx/introspect`, is captured). Chains through to the original fetch and
 * reads NOTHING from the body or headers. Idempotent; call only when feedback
 * is enabled.
 */
export const installFetchTap = (): void => {
  if (fetchTapInstalled || typeof window === 'undefined' || typeof window.fetch !== 'function') {
    return;
  }
  fetchTapInstalled = true;
  hydrateOnce();
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await originalFetch(input, init);
    try {
      const url = typeof input === 'string'
        ? input
        : (input as Request)?.url ?? String(input);
      if (url && url.indexOf(IDX_URL_FRAGMENT) >= 0) {
        lastRequest = {
          url,
          method: init?.method ?? (input as Request)?.method ?? 'GET',
          httpStatus: response.status,
          body: parseRequestBody(init),
        };
      }
    } catch {
      // never let diagnostics interfere with the actual request
    }
    return response;
  };
};

/**
 * Record a transaction as it becomes the current one. Safe to call for every
 * transaction (bootstrap, form submit, poll promotion); consecutive identical
 * steps are collapsed.
 */
export const recordTransaction = (
  txn?: IdxTransaction,
  options?: { includeRaw?: boolean },
): void => {
  if (!txn) {
    return;
  }
  hydrateOnce();
  const eventCtx = getEventContext(txn);
  const messages = getMessages(txn);
  const messageKeys = messages
    .map((m) => m.i18n?.key)
    .filter((k): k is string => typeof k === 'string');

  const last = transactions[transactions.length - 1];
  const step = eventCtx.formName ?? 'unknown';
  const isRepeat = last
    && last.step === step
    && last.requestDidSucceed === txn.requestDidSucceed
    && JSON.stringify(last.messageKeys) === JSON.stringify(messageKeys);

  if (isRepeat) {
    // collapse consecutive identical steps (e.g. polling)
    last.count = (last.count ?? 1) + 1;
    last.ts = Date.now();
    last.requestUrl = lastRequest.url ?? last.requestUrl;
    last.httpStatus = lastRequest.httpStatus ?? last.httpStatus;
  } else {
    transactions.push({
      seq: transactions.length,
      ts: Date.now(),
      step,
      requestUrl: lastRequest.url,
      method: lastRequest.method,
      httpStatus: lastRequest.httpStatus,
      idxStatus: txn.status,
      requestDidSucceed: txn.requestDidSucceed,
      messageKeys,
      authenticatorKey: eventCtx.authenticatorKey,
      // PII/secret-bearing (request body carries credentials/OTP; response carries
      // stateHandle/identifier) — attachment-only, must be scrubbed before prod
      ...(options?.includeRaw
        ? { requestBody: lastRequest.body, rawResponse: txn.rawIdxState }
        : {}),
    });
    if (transactions.length > MAX_RECORDS) {
      transactions.shift();
    }
  }
  persist();
};

const collectEnvironment = (): SiwDiagnosticBundle['environment'] => {
  try {
    return {
      userAgent: navigator?.userAgent,
      language: navigator?.language,
      languages: navigator?.languages ? Array.from(navigator.languages) : undefined,
      platform: navigator?.platform,
      viewport: { width: window?.innerWidth, height: window?.innerHeight },
      online: navigator?.onLine,
      cookieEnabled: navigator?.cookieEnabled,
    };
  } catch {
    return {};
  }
};

/**
 * Assemble the diagnostic bundle to send to Sentry. Called on demand when the
 * user clicks "Send feedback" on a terminal error view.
 */
export const buildDiagnosticBundle = (ctx: IWidgetContext): SiwDiagnosticBundle => {
  hydrateOnce();
  const txn = ctx.idxTransaction;
  const widgetProps = ctx.widgetProps as WidgetProps;
  const eventCtx = getEventContext(txn);
  const messages = (txn ? getMessages(txn) : []).map((m) => ({
    i18nKey: m.i18n?.key,
    class: m.class,
    message: m.message,
  }));
  const userInfo = txn ? getUserInfo(txn) : {};

  return {
    capturedAt: Date.now(),
    widget: {
      version: OKTA_SIW_VERSION,
      commit: OKTA_SIW_COMMIT_HASH,
      engine: 'gen3',
    },
    flow: {
      type: widgetProps?.flow,
      formName: eventCtx.formName,
      controller: eventCtx.controller,
      authenticatorKey: eventCtx.authenticatorKey,
      methodType: eventCtx.methodType,
    },
    error: { messages },
    transactions: [...transactions],
    environment: collectEnvironment(),
    config: {
      issuerOrigin: widgetProps ? getBaseUrl(widgetProps) : undefined,
      clientId: widgetProps?.clientId,
    },
    user: userInfo?.identifier ? { identifier: userInfo.identifier } : undefined,
  };
};

/** Clear the accumulated trail (e.g. after a successful send). */
export const resetDiagnostics = (): void => {
  transactions = [];
  lastRequest = {};
  const store = safeGetSession();
  try {
    store?.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
};
