import { BaseForm, BaseView } from '../internals';
import { loc } from '@okta/courage';

const Body = BaseForm.extend({
  title: function() {
    return "Please Approve or Reject Your Enrollment";
  },
  subtitle: function() {
    const subtitle = "";
    return subtitle;
  },
  noButtonBar: true,
});

export default BaseView.extend({
  Body,
});

