import { ApiClientConfig, getEmailMessages, getSMSMessages } from '@okta/dockolith';
import crypto = require('crypto');
import { UserCredentials } from "./management-api/createCredentials";
import waitForOneSecond from './wait/waitForOneSecond';

export class MonolithClient {
  config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  async createCredentials(firstName: string, lastName = ''): Promise<UserCredentials>  {
    lastName = lastName.substring(0, 32);
    const emailAddress = `${firstName}.${Date.now()}@okta1.com`;
    const phoneNumber = `+${Date.now().toString().substring(0, 10)}`;
    const credentials = {
      firstName,
      lastName: lastName || `Mc${firstName}face`,
      password: crypto.randomBytes(16).toString('base64'),
      emailAddress,
      phoneNumber,
    };
    console.error('Created credentials: ', credentials);
    return credentials;
  }

  async getEmailCode(emailAddress: string) {
    const messages = await getEmailMessages(this.config, emailAddress);
    console.error('getEmailCode messages: ', messages);
    const content = messages[0].text;

    const match = content.match(/Enter a code instead: (?<code>\d+)/) ||
      content.match(/enter this code: <b>(?<code>\d+)<\/b>/);
    const code = match?.groups?.code;
    if (!code) {
      throw new Error('Unable to retrieve code from email.');
    }
    console.error('extracted code: ', code);
    return code;
  }

  async getPasswordResetMagicLink(emailAddress: string) {
    const messages = await getEmailMessages(this.config, emailAddress);
    console.error('getPasswordResetMagicLink messages: ', messages);
    const content = messages[0].text;

    const match = content?.match(/<a id="reset-password-link" href="(?<url>\S+)"/);
    const url = match?.groups?.url;
    if (!url) {
      throw new Error('Unable to retrieve magic link from email.');
    }
    console.error('extracted url: ', url);
    return url;
  }

  async getUnlockAccountLink(emailAddress: string) {

    const messages = await getEmailMessages(this.config, emailAddress);
    console.error('getUnlockAccountLink messages: ', messages);
    const content = messages[0].text;
    const match = content?.match(/<a id="unlock-account-link" href="(?<url>\S+)"/);
    const url = match?.groups?.url;
    if (!url) {
      throw new Error('Unable to retrieve unlock account link from email.');
    }
    console.error('extracted url: ', url);
    return url;
  }

  async getSMSCode(phoneNumber: string) {
    const messages = await getSMSMessages(this.config, phoneNumber);
    console.error('getSMSCode messages: ', messages);
    const content = messages[0].text;

    const match = content?.match(/Your verification code is (?<code>\d+)/);
    const code = match?.groups?.code;
    if (!code) {
      throw new Error('Unable to retrieve code from SMS.');
    }
    console.error('extracted code: ', code);
    return code;
  }

  async getEmailMagicLink(emailAddress: string) {
    let retryAttemptsRemaining = 5;
    let content;
    while (!content && retryAttemptsRemaining > 0) {
      await waitForOneSecond();
      const messages = await getEmailMessages(this.config, emailAddress);
      console.error('getEmailMagicLink messages: ', messages);
      content = messages[0].html;
      --retryAttemptsRemaining;
    }

    const match = content?.match(/<a id="(?:email-authentication-button|email-activation-button|registration-activation-link)" href="(?<url>\S+)"/);
    const url = match?.groups?.url;
    if (!url) {
      throw new Error('Unable to retrieve magic link from email.');
    }

    return url;
  }
}
