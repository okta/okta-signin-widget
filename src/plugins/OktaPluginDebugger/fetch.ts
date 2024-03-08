/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

export interface FetchData {
  httpMethod?: string,
  url: string,
  reqBody?: string | Record<string, any>,
  reqHeaders?: Record<string, string>,
  resHeaders?: Record<string, string>,
  resBody?: string | Record<string, any>,
  status?: number,
  statusText?: string,
  ok?: boolean,
  meta?: Omit<RequestInit, 'body' | 'headers' | 'method'> & {
    responseType?: ResponseType;
    responseUrl?: string;
  },
  err?: Error,
}
type OnNewFetch = (fetchData: FetchData) => void;

let origFetch: typeof fetch | undefined;
let onNewFetch: OnNewFetch | undefined;

const readResponseData = (response: Response): Promise<Record<string, any> | string> => {
  if (
    response.headers.get('Content-Type') &&
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    response.headers.get('Content-Type')!.toLowerCase().indexOf('application/json') >= 0
  ) {
    return response.json();
  } else {
    return response.text();
  }
};

const readHeaders = (headers?: Headers | HeadersInit): Record<string, string> | undefined => {
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  } else if (typeof headers?.forEach === 'function') {
    const obj: Record<string, string> = {};
    (headers as Headers).forEach((v, k) => {
      obj[k] = v;
    });
    return obj;
  } else {
    return headers as Record<string, string>;
  }
};

const getRequestBody = (init?: RequestInit): string | Record<string, any> | undefined => {
  const body = init?.body;
  if (!body) {
    return undefined;
  }
  if (typeof (body as FormData)?.forEach === 'function') {
    // URLSearchParams or FormData
    const data: Record<string, string> = {};
    (body as FormData)?.forEach((v, k) => {
      if (typeof v === 'string') {
        data[k] = v;
      }
    });
    return data;
  }
  if (typeof body === 'string' && body.length && body[0] === '{') {
    try {
      return JSON.parse(body);
    } catch (_) {}
  }
  return body?.toString?.() ?? body;
};

export const setOnNewFetch = (newCallback: OnNewFetch | undefined) => {
  onNewFetch = newCallback;
};

export const overrideFetch = () => {
  // `fetch` should be polyfilled for IE11 with `cross-fetch/polyfill`
  // eslint-disable-next-line compat/compat
  origFetch = window.fetch;
  if (!origFetch) {
    return;
  }
  // eslint-disable-next-line compat/compat
  window.fetch = async (input, init) => {
    let fetchData: FetchData = {
      url: input as string
    };
    try {
      const reqMeta = {...(init || {})};
      const { method } = reqMeta;
      const reqBody = getRequestBody(init);
      const reqHeaders = readHeaders(init?.headers);
      delete reqMeta.body;
      delete reqMeta.headers;
      delete reqMeta.method;
      const url = input.toString();
      fetchData = {
        httpMethod: method,
        url,
        reqBody,
        reqHeaders,
        meta: reqMeta,
      };
      const resp = await (origFetch as typeof fetch)(input, init);
      const respClone = resp.clone();
      const {
        status,
        statusText,
        ok,
        type: responseType,
        url: responseUrl,
      } = respClone;
      const resHeaders = readHeaders(respClone.headers);
      const resBody = await readResponseData(respClone);
      fetchData = {
        ...fetchData,
        status,
        statusText,
        ok,
        resHeaders,
        resBody,
        meta: {
          ...fetchData.meta,
          responseType,
          responseUrl,
        }
      };
      onNewFetch?.(fetchData);
      return resp;
    } catch (err) {
      fetchData.err = err;
      onNewFetch?.(fetchData);
      throw err;
    }
  };
};

export const restoreFetch = () => {
  if (origFetch) {
    window.fetch = origFetch;
    origFetch = undefined;
  }
};
