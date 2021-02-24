import { loc } from 'okta';
import AdminConsentViewHeader from './AdminConsentViewHeader';

export default AdminConsentViewHeader.extend({
  titleText: () => loc('oie.consent.enduser.title', 'login'),
  hasIssuer: false,
});
