import Dom from './Dom';
export default Dom.extend({
  authContainer: function() {
    return this.el('auth-container');
  },

  canBeMinimized: function() {
    return this.authContainer().hasClass('can-remove-beacon');
  },
});
