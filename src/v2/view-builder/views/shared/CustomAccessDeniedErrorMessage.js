import { View } from 'okta';
import hbs from 'handlebars-inline-precompile';

export default View.extend({
  className: 'custom-access-denied-error-message',
  template: hbs`
    <p>{{message}}</p>
    {{#if links}}
      <div class="custom-links">
        {{#each links}}
        <a href={{url}} target="_blank" rel="noopener noreferrer">
          {{label}}
        </a>
        {{/each}}
      </div>
    {{/if}}
  `,
  getTemplateData() {
    return {
      message: this.options.message,
      links: this.options.links,
    };
  },
});