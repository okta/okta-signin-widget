/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApiClientConfig, getEmailMessages, getSMSMessages } from '@okta/dockolith';
import crypto = require('crypto');
import { UserCredentials } from "../management-api/createCredentials";
import waitForOneSecond from '../wait/waitForOneSecond';

export class MonolithClient {
  config: ApiClientConfig;

  constructor(config?: ApiClientConfig) {
    if (config) {
      this.config = config;
    } else {
      const {
        WIDGET_TEST_SERVER,
        OKTA_CLIENT_TOKEN
      } = process.env;
      this.config = {
        orgUrl: WIDGET_TEST_SERVER!,
        token: OKTA_CLIENT_TOKEN!
      };
    }
  }

  async createCredentials(firstName: string, lastName = ''): Promise<UserCredentials>  {
    lastName = lastName.substring(0, 32);

    const rand1 = crypto.randomBytes(16).toString('base64');
    const rand2 = crypto.randomBytes(16).toString('base64');

    const emailAddress = `${firstName}.${rand1}@okta1.com`;
    const phoneNumber = `+${Date.now().toString().substring(0, 11)}`;
    const credentials = {
      firstName,
      lastName: lastName || `Mc${firstName}face`,
      password: `Aa1${rand2}`,
      emailAddress,
      phoneNumber,
    };
    console.error('Created credentials: ', credentials);
    return credentials;
  }

  async getLatestEmail(emailAddress: string) {
    let retryAttemptsRemaining = 5;
    let content;
    while (!content && retryAttemptsRemaining > 0) {
      await waitForOneSecond();
      const messages = await getEmailMessages(this.config, emailAddress);
      content = messages[0].html;
      --retryAttemptsRemaining;
    }
    if (!content) {
      throw new Error('Unable to retrieve latest email');
    }
    //console.log('getLatestEmail', content);
    return content;
  }

  async getLatestSMS(phoneNumber: string) {
    let retryAttemptsRemaining = 5;
    let content;
    while (!content && retryAttemptsRemaining > 0) {
      await waitForOneSecond();
      const messages = await getSMSMessages(this.config, phoneNumber);
      content = messages[0].text;
      --retryAttemptsRemaining;
    }
    if (!content) {
      throw new Error('Unable to retrieve latest SMS');
    }
    //console.log('getLatestSMS', content);
    return content;
  }

  async getEmailCode(emailAddress: string) {
    const content = await this.getLatestEmail(emailAddress);

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
    const content = await this.getLatestEmail(emailAddress);
    const match = content?.match(/<a id="reset-password-link" href="(?<url>\S+)"/);
    const url = match?.groups?.url;
    if (!url) {
      throw new Error('Unable to retrieve magic link from email.');
    }
    console.error('extracted url: ', url);
    return url;
  }

  async getUnlockAccountLink(emailAddress: string) {
    const content = await this.getLatestEmail(emailAddress);
    const match = content?.match(/<a id="unlock-account-link" href="(?<url>\S+)"/);
    const url = match?.groups?.url;
    if (!url) {
      throw new Error('Unable to retrieve unlock account link from email.');
    }
    console.error('extracted url: ', url);
    return url;
  }

  async getSMSCode(phoneNumber: string) {
    const content = await this.getLatestSMS(phoneNumber);
    const match = content?.match(/Your verification code is (?<code>\d+)/);
    const code = match?.groups?.code;
    if (!code) {
      throw new Error('Unable to retrieve code from SMS.');
    }
    console.error('extracted code: ', code);
    return code;
  }

  async getEmailMagicLink(emailAddress: string) {
    const content = await this.getLatestEmail(emailAddress);
    const match = content?.match(/<a id="(?:email-authentication-button|email-activation-button|registration-activation-link)" href="(?<url>\S+)"/);
    const url = match?.groups?.url;
    if (!url) {
      throw new Error('Unable to retrieve magic link from email.');
    }
    return url;
  }
}
