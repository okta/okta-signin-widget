import type { WidgetOptions } from '@okta/okta-signin-widget';
import {
  saveConfigToStorage,
  getConfig,
  resetConfig,
  updateConfigInUrl,
  formatWidgetOptions,
  extendConfig,
} from './config';
import { ConfigForm, getConfigFromForm, updateFormFromConfig } from './configForm';
import { Config } from './types';
import { loadPolyfill, loadWidgetScript, makeClickHandler, removePolyfill } from './util';

export const ConfigHeader = `
  <div class="header">
    <strong>Config</strong>
    <div id="config-controls">
      <button name="showConfig" class="pure-button">Show</button>
      <button name="hideConfig" class="pure-button">Hide</button>
      <button name="resetConfig" class="pure-button">Reset</button>
    </div>
  </div>
`;

export const ConfigEditor = `
  <div class="box">
    <div class="header">
      <strong>Editor (JSON format)</strong>
    </div>
    <textarea id="config-editor" cols="80" rows="16"></textarea>
  </div>
`;

export const ConfigPreview = `
  <div class="box">
    <div class="header">
      <strong>Config Preview</strong>
    </div>
    <pre id="config-preview"></pre>
  </div>
`;

export const ConfigTemplate = `
  <div id="config-container">
    ${ConfigHeader}
    <div class="boxes">
      ${ConfigForm}
      ${ConfigEditor}
      ${ConfigPreview}
    </div>
  </div>
`;

export function showConfig(): void {
  const configBoxes = document.querySelector('#config-container > .boxes') as HTMLElement;
  configBoxes.style.display = 'block';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).hideConfig = makeClickHandler(showConfig);

export function hideConfig(): void {
  const configBoxes = document.querySelector('#config-container > .boxes') as HTMLElement;
  configBoxes.style.display = 'none';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).hideConfig = makeClickHandler(hideConfig);
export default class ConfigArea {
  configForm: HTMLElement;
  configEditor: HTMLElement;
  configPreview: HTMLElement;

  // action buttons
  startButton: HTMLElement;
  hideButton: HTMLElement;
  showButton: HTMLElement;
  resetButton: HTMLElement;

  bootstrap(rootElem?: HTMLElement): Config {
    // if no rootElem is passed, bootstrap should be called after ConfigTemplate is in the DOM
    if (rootElem) {
      rootElem.innerHTML = ConfigTemplate;
    }

    // set elements
    this.configForm = document.getElementById('config-form');
    this.configEditor = document.getElementById('config-editor');
    this.configPreview = document.getElementById('config-preview');
    this.hideButton = document.querySelector('#config-container button[name="hideConfig"]');
    this.showButton = document.querySelector('#config-container button[name="showConfig"]');
    this.resetButton = document.querySelector('#config-container button[name="resetConfig"]');

    const config = getConfig();
    this.updateConfigPreview(formatWidgetOptions(config.widgetOptions));
    this.updateConfigEditor(config.widgetOptions);
    this.persistConfig(config);

    this.addEventListeners();
    return config;
  }

  addEventListeners(): void {
    this.configForm.addEventListener('change', () => {
        const formConfig = getConfigFromForm();
        const currentConfig = getConfig();
        const config = extendConfig(currentConfig, formConfig);
        loadWidgetScript(config.bundle, config.useMinBundle);
        if (config.usePolyfill) {
          loadPolyfill(config.useMinBundle);
        } else {
          removePolyfill();
        }
        const str = formatWidgetOptions(config.widgetOptions);
        this.updateConfigPreview(str);
        this.updateConfigEditor(config.widgetOptions);
        this.persistConfig(config);
    })
    this.configEditor.addEventListener('input', (event: InputEvent) => {
      const { value } = event.target as HTMLInputElement;
      const widgetOptions = this.updateConfigPreview(value);
      if (widgetOptions) {
        const currentConfig = getConfig();
        const config = {
          ...currentConfig,
          widgetOptions,
        }
        this.persistConfig(config);
      }
    });

    this.hideButton.addEventListener('click', () => {
      hideConfig();
    });
    this.showButton.addEventListener('click', () => {
      showConfig();
    });
    this.resetButton.addEventListener('click', () => {
      resetConfig();
    });
  }

  updateConfigPreview(value: string): WidgetOptions | undefined {
    try {
      const parsedOptions = JSON.parse(value) as WidgetOptions;
      this.configPreview.innerHTML = formatWidgetOptions(parsedOptions);
      return parsedOptions;
    } catch (e) {
      // do nothing, only render preview when config is ready as JSON format
    }
  }
  
  updateConfigEditor(options: WidgetOptions) {
    const str = formatWidgetOptions(options);
    this.configEditor.innerHTML = str;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.configEditor.value = str;
  }

  persistConfig(config: Config) {
    saveConfigToStorage(config);
    updateFormFromConfig(config);
    updateConfigInUrl(config);
  }
}