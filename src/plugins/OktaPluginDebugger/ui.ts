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

import CSS from './styles';
import { ConsoleMessage, ConsoleMethod } from './console';
import { serializeValue } from './utils';
import { FetchData } from './fetch';
import { getMessages, serializeArgs, serializeMessages } from './messages';

let ui: {
  rootContainer?: HTMLDivElement,
  container?: HTMLDivElement,
  switchBtn?: HTMLButtonElement,
  copyBtn?: HTMLButtonElement,
  copyTextarea?: HTMLTextAreaElement,
  list?: HTMLOListElement,
  style?: HTMLStyleElement,
  isHidden: boolean,
} | undefined;


export const initUI = (cspNonce?: string): void => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      addUI(cspNonce);
    });
  } else {
    addUI(cspNonce);
  }
};

const addUI = (cspNonce?: string) => {
  ui = {
    isHidden: true
  };
  ui.style = document.createElement('style');
  ui.style.textContent = CSS;
  if (cspNonce) {
    ui.style.setAttribute('nonce', cspNonce);
  }

  ui.rootContainer = document.createElement('div');
  ui.rootContainer.className = 'siw-debugger-root-container';
  if (ui.isHidden) {
    ui.rootContainer.classList.add('siw-debugger-hidden');
  }

  ui.container = document.createElement('div');
  ui.container.className = 'siw-debugger-container';
  ui.rootContainer.appendChild(ui.container);

  ui.list = document.createElement('ol');
  ui.list.className = 'siw-debugger-list';
  renderMessagesList(getMessages());
  ui.container.appendChild(ui.list);

  ui.switchBtn = document.createElement('button');
  ui.switchBtn.className = 'siw-debugger-button';
  ui.switchBtn.innerText = 'Console';
  ui.switchBtn.onclick = () => {
    if (ui) {
      ui.isHidden = !ui.isHidden;
      if (ui.isHidden) {
        ui.switchBtn?.classList.remove('siw-debugger-selected');
        ui.rootContainer?.classList.add('siw-debugger-hidden');
        document.body.classList.remove('siw-debugger-no-scroll');
      } else {
        ui.switchBtn?.classList.add('siw-debugger-selected');
        ui.rootContainer?.classList.remove('siw-debugger-hidden');
        document.body.classList.add('siw-debugger-no-scroll');
      }
    }
  };

  ui.copyBtn = document.createElement('button');
  ui.copyBtn.className = 'siw-copy-button';
  ui.copyBtn.innerText = 'Copy to clipboard';
  ui.copyBtn.onclick = () => {
    copyToClipboard(serializeMessages(getMessages()));
  };

  ui.copyTextarea = document.createElement('textarea');
  ui.copyTextarea.className = 'siw-copy-textarea siw-debugger-hidden';

  [
    ui.copyTextarea,
    ui.rootContainer,
    ui.switchBtn,
    ui.copyBtn,
    ui.style,
  ].map((elem) => {
    document.body.appendChild(elem);
  });
};

export const removeUI = () => {
  [
    ui?.style,
    ui?.switchBtn,
    ui?.copyBtn,
    ui?.copyTextarea,
    ui?.rootContainer
  ].map((elem) => {
    if (elem) {
      document.body.removeChild(elem);
    }
  });
  ui = undefined;
};

const copyToClipboard = (str: string) => {
  try {
    // Supported in modern browsers
    // eslint-disable-next-line compat/compat
    navigator.clipboard.writeText(str);
  } catch(_e) {
    // Supported in IE11
    if (ui.copyTextarea) {
      ui.copyTextarea.classList.remove('siw-debugger-hidden');
      ui.copyTextarea.value = str;
      ui.copyTextarea.select();
      document.execCommand('copy');
    }
  }
};

export const renderMessageToList = (msg: ConsoleMessage) => {
  if (ui?.list) {
    const item = renderMessage(msg);
    ui.list.appendChild(item);
  }
};

export const renderMessagesList = (messages: ConsoleMessage[]) => {
  if (ui?.list) {
    ui.list.innerHTML = '';
    for (const msg of messages) {
      const item = renderMessage(msg);
      ui.list.appendChild(item);
    }
  }
};

const renderCollapsedContent = (data: any, name: string): [HTMLButtonElement?, HTMLPreElement?] => {
  if (data === undefined || data === null) {
    return [];
  }
  const content = document.createElement('pre');
  content.className = `siw-debugger-list-item-details`;
  content.innerText = serializeValue(data);

  let isHidden = true;
  if (isHidden) {
    content.classList.add('siw-debugger-hidden');
  }

  const btn = document.createElement('button');
  btn.className = 'siw-switch-button';
  btn.innerText = name;
  btn.onclick = () => {
    isHidden = !isHidden;
    if (isHidden) {
      btn.classList.remove('siw-debugger-selected');
      content.classList.add('siw-debugger-hidden');
    } else {
      btn.classList.add('siw-debugger-selected');
      content.classList.remove('siw-debugger-hidden');
    }
  };
  return [btn, content];
};

const renderFetchMessage = (fetchData: FetchData, container: HTMLElement) => {
  const {
    httpMethod, url, status,
    reqHeaders, reqBody, resHeaders, resBody,
    err,
    meta,
  } = fetchData;
  const fetchMeta = {
    reqHeaders,
    resHeaders,
    ...meta,
  };

  const headerEl = document.createElement('pre');
  headerEl.className = 'siw-debugger-list-item-header';
  const titleEl = document.createElement('span');
  titleEl.className = 'siw-debugger-list-item-title';
  titleEl.innerText = `${status} ${httpMethod} ${url}`;
  headerEl.appendChild(titleEl);
  const [reqBtn, reqContent] = renderCollapsedContent(reqBody, 'Request');
  const [resBtn, resContent] = renderCollapsedContent(resBody, 'Response');
  const [metaBtn, metaContent] = renderCollapsedContent(fetchMeta, 'Headers');
  [reqBtn, resBtn, metaBtn].map((elem) => {
    if (elem) {
      headerEl.appendChild(elem);
    }
  });
  container.appendChild(headerEl);

  [reqContent, resContent, metaContent].map((elem) => {
    if (elem) {
      container.appendChild(elem);
    }
  });
  if (err) {
    renderMessageContent([err], container, false);
  }
};

const renderMessageContent = (args: any[], container: HTMLElement, firstArgIsHeader: boolean) => {
  const serializedArgs = serializeArgs(args);
  serializedArgs.forEach((arg, i) => {
    const content = document.createElement('pre');
    content.className = i === 0 && firstArgIsHeader
      ? 'siw-debugger-list-item-header'
      : 'siw-debugger-list-item-details';
    content.innerText = arg;
    container.appendChild(content);
  });
};

const renderMessage = ({method, args, time}: ConsoleMessage) => {
  const methodShortMap: Partial<Record<ConsoleMethod, string>> = {
    group: 'grp',
    groupCollapsed: 'grp',
    groupEnd: 'grpe',
    assert: 'asrt',
  };
  const isXHR = args[0] === '[XHR]';
  const li = document.createElement('li');
  li.className = `siw-debugger-list-item siw-debugger-list-item-${method}`;
  if (isXHR) {
    li.className += ' siw-debugger-list-item-xhr';
  }
  const typeEl = document.createElement('div');
  typeEl.className = `siw-debugger-list-item-type`;
  typeEl.innerText = methodShortMap[method] || method;
  li.appendChild(typeEl);

  const timeEl = document.createElement('div');
  timeEl.className = `siw-debugger-list-item-time`;
  timeEl.innerText = time;
  li.appendChild(timeEl);

  if (isXHR) {
    renderFetchMessage(args[1] as FetchData, li);
  } else {
    renderMessageContent(args, li, true);
  }

  return li;
};
