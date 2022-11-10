import { View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';

export default View.extend({
  className: 'custom-access-denied-error-message',
  template: hbs`
    {{#if message}}
      <p>{{message}}</p>
    {{/if}}
    {{#if links}}
      <ul class="custom-links">
        {{#each links}}
        <li>
          <a href={{url}} target="_blank" rel="noopener noreferrer">
            {{label}}
          </a>
        </li>
        {{/each}}
      </ul>
    {{/if}}
  `,
  getTemplateData() {
    return {
      message: this.options.message,
      links: this.options.links,
    };
  },
});