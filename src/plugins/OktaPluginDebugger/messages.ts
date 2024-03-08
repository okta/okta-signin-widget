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

import { FetchData } from './fetch';
import { ConsoleMethod, ConsoleMessage } from './console';
import { getCurrentTimeStamp, serializeValue } from './utils';

const messages: ConsoleMessage[] = [];

export const getMessages = () => {
  return messages;
};

export const addMessage = (msg: ConsoleMessage) => {
  msg.time = getCurrentTimeStamp();
  messages.push(msg);
};

export const clearMessages = () => {
  messages.length = 0;
};

export const fetchDataToMessage = (fetchData: FetchData): ConsoleMessage => {
  const isError = fetchData.err || !fetchData.ok;
  const method: ConsoleMethod = isError ? 'error' : 'debug';
  const msg = {
    method,
    args: [
      '[XHR]',
      fetchData
    ],
  };
  return msg;
};

export const serializeArgs = (args: any[]): string[] => {
  return args
    // Concat strings
    .reduce<any[]>((acc: any[], arg: any, i) => (
      acc.length && typeof acc[i-1] === 'string' && typeof arg === 'string'
        ? [...acc.slice(0, -1), `${acc[i-1]} ${arg}`]
        : [...acc, arg]
    ), [])
    // Print stacktrace in separate element rather than as part of JSON
    .reduce<any[]>((acc: any[], arg: any) => (
      arg?.stack
        ? [...acc, arg?.stack, serializeValue(arg, ['stack'])]
        : [...acc, serializeValue(arg)]
    ), []);
};

export const serializeMessages = (messages: ConsoleMessage[]) => {
  return messages.map((msg, i) => serializeMessage(msg, i+1)).join('\n');
};

const serializeMessage = ({method, args, time}: ConsoleMessage, no: number) => {
  const lines = [];
  const isXHR = args[0] === '[XHR]';
  if (isXHR) {
    const {
      httpMethod, url, status,
      reqHeaders, reqBody, resHeaders, resBody,
      err,
      meta,
    } = args[1] as FetchData;
    const fetchMeta = {
      reqHeaders,
      resHeaders,
      ...meta,
    };
    const title = `${status} ${httpMethod} ${url}`;
    lines.push(title);
    if (reqBody) {
      lines.push('Request: ' + serializeValue(reqBody));
    }
    if (resBody) {
      lines.push('Response: ' + serializeValue(resBody));
    }
    lines.push('Meta: ' + serializeValue(fetchMeta));
    if (err) {
      lines.push(...serializeArgs([err]));
    }
  } else {
    lines.push(...serializeArgs(args));
  }
  const paddedNo = String(no).padStart(4, ' ');
  const paddedMethod = method.toUpperCase().padEnd(5, ' ');
  const prefix = `#${paddedNo}. ${time} [${paddedMethod}]  `;
  lines[0] = prefix + lines[0];
  return lines.join('\n');
};
