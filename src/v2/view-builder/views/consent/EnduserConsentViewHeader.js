import { loc } from '@okta/courage';
import AdminConsentViewHeader from './AdminConsentViewHeader';

export default AdminConsentViewHeader.extend({
  titleText: () => loc('oie.consent.scopes.enduser.title', 'login'),
  hasIssuer: false,
});
