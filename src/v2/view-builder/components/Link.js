/*!
 * Copyright (c) 2020, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';

export default View.extend({

  template: hbs('{{label}}'),

  tagName: 'a',

  attributes() {
    let href = this.options.href || '#';
    return {
      'data-se': this.options.name,
      href: href,
      target: this.options.target,
    };
  },

  className() {
    const names = ['link'];
    if (this.options.name) {
      const nameToClass = this.options.name.replace(/[ ]/g, '-');
      names.push(`js-${nameToClass}`);
    }
    return names.join(' ');
  },

  postRender() {
    // TODO OKTA-245224: create sub class of Link to dispatch following if/else logic.
    if (!this.options.href) {
      this.$el.click((event) => {
        event.preventDefault();

        const {
          appState,
          formName,
          actionPath,
          clickHandler,
        } = this.options;

        if (clickHandler) {
          clickHandler();
        } else if (formName) {
          appState.trigger('switchForm', formName);
        } else if (actionPath) {
          appState.trigger('invokeAction', actionPath);
        }
      });
    }
  }
});
