import { createCallout } from 'okta';
import { USER_FEEDBACK_TIMEOUT } from '../utils/Constants';
import sessionStorageHelper from '../../client/sessionStorageHelper';

const addUserFeedbackCallout = (content, container) => {
  const messageCallout = createCallout({
    type: 'info',
    content
  });

  // Get message container from the parent since it's not in the scope of this view
  // const messageContainer = this.$el.parent();
  // messageContainer.prepend(messageCallout.render().el);

  container.add(messageCallout, { prepend: true });

  // Dismiss callout after timeout
  const userFeedbackTimeout = setInterval(() => {
    const start = sessionStorageHelper.getResendTimestamp();
    const now = Date.now();
    if (now - start >= USER_FEEDBACK_TIMEOUT) {
      messageCallout.remove();
      clearInterval(userFeedbackTimeout);
    }
  }, 500);

  return userFeedbackTimeout;
};

export { addUserFeedbackCallout };
