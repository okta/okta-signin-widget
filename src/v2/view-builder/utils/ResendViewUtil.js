import { createCallout } from 'okta';
import { USER_FEEDBACK_TIMEOUT } from '../utils/Constants';
import sessionStorageHelper from '../../client/sessionStorageHelper';

const addUserFeedbackCallout = (content, container) => {
  const messageCallout = createCallout({
    type: 'info',
    content
  });

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
