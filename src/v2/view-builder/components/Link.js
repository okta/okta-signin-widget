/*!
 * Copyright (c) 2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { View } from 'okta';
import hbs from 'handlebars-inline-precompile';

const Link = View.extend({

  template: hbs('{{label}}'),

  tagName: 'a',

  attributes () {
    let href = this.options.href  || '#';
    return {
      'data-se': this.options.name,
      href: href
    };
  },

  className () {
    const nameToClass = this.options.name.replace(/[ ]/g, '-');

    return `link js-${nameToClass}`;
  },

  postRender () {
    //TODO OKTA-245224
    if (!this.options.href) {
      this.$el.click((event) => {
        const appState = this.options.appState;
        event.preventDefault();
        this.options.formName? appState.trigger('switchForm', this.options.formName):
          appState.trigger('invokeAction', this.options.actionPath);
      });
    }
  }
});

module.exports = Link;
