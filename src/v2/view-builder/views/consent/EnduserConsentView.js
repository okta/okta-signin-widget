import AdminConsentView from './AdminConsentView';
import EnduserConsentViewFooter from './EnduserConsentViewFooter';
import EnduserConsentViewHeader from './EnduserConsentViewHeader';
import EnduserConsentAgreementText from './EnduserConsentAgreementText';


export default AdminConsentView.extend({
  Header: EnduserConsentViewHeader,
  Footer: EnduserConsentViewFooter,
  postRender() {
    const scopeList = this.$el.find('.scope-list');
    const consentAgreementText = new EnduserConsentAgreementText().render().el;
    scopeList.after(consentAgreementText);
  }
});
