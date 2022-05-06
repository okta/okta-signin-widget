import ListView from '../framework/ListView.js';
import BaseView from './BaseView.js';

/**
 * See {@link src/framework/ListView} for more detail and examples from the base class.
 * @class module:Okta.ListView
 * @extends src/framework/ListView
 * @mixes module:Okta.View
 */

var Backbone_ListView = BaseView.decorate(ListView);

export { Backbone_ListView as default };
