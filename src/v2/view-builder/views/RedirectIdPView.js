import IdentifierView from './IdentifierView';

export default IdentifierView.extend({
  render() {
    IdentifierView.prototype.render.apply(this, arguments);

    this.$el.find('.sign-in-with-idp .separation-line').hide();
    this.$el.find('.button-primary').hide();
  }
});
