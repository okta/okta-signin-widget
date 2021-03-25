import polling from '../views/shared/polling';
import BaseForm from './BaseForm';

export default BaseForm.extend(Object.assign(
  {
    initialize() {
      BaseForm.prototype.initialize.apply(this, arguments);
      this.listenTo(this.options.appState, 'change:dynamicRefreshInterval', this.updateRefreshInterval);
    },

    updateRefreshInterval() {
      if (this.polling) {
        this.stopPolling();
        this.startPolling(this.options.appState.get('dynamicRefreshInterval'));
      }
    },
  },
  polling,
));
