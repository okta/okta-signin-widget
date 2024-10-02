/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { OktaAuth } from '@okta/okta-auth-js';
import omit from 'lodash/omit';

import {
  WebAuthNAuthenticationHandler,
  WebAuthNAutofillUICredentials,
  WebAuthNChallengeDataWithUserVerification,
  WebAuthNEnrollmentHandler
} from '../types';
import { loc } from 'util/loc';

export const binToStr = (bin: ArrayBuffer): string => btoa(
  new Uint8Array(bin).reduce((s, byte) => s + String.fromCharCode(byte), ''),
);

export const base64UrlSafeToBase64 = (str: string) => str.replace(new RegExp('_', 'g'), '/').replace(new RegExp('-', 'g'), '+');

export const strToBin = (str: string) => Uint8Array.from(atob(base64UrlSafeToBase64(str)), c => c.charCodeAt(0));

export const isCredentialsApiAvailable = ():
boolean => !!(navigator && navigator.credentials && navigator.credentials.create);

export const isConditionalMediationAvailable = () =>
  typeof PublicKeyCredential !== 'undefined'
    && typeof PublicKeyCredential.isConditionalMediationAvailable !== 'undefined';

// checks if the browser supports passkey autofill by making sure it supports conditional mediation
// https://passkeys.dev/docs/reference/terms/#autofill-ui
export const isPasskeyAutofillAvailable = async () => {
  let isAvailable = false;
  if (isConditionalMediationAvailable()) {
    // eslint-disable-next-line no-undef
    isAvailable = await PublicKeyCredential.isConditionalMediationAvailable();
  }
  return isAvailable;
}

/**
 * Uses the Web Authentication API to generate credentials for enrolling
 * a user into the WebAuthN flow
 *
 * Used by {@link WebAuthNSubmitButton.tsx} Renderer to initiate the WebAuthN Enrollment flow.
 */
export const webAuthNEnrollmentHandler: WebAuthNEnrollmentHandler = async (transaction) => {
  // @ts-ignore OKTA-499928 authenticatorEnrollments missing from rawIdxState
  const { nextStep, rawIdxState: { authenticatorEnrollments } } = transaction;
  // NextStep is guranteed to be available here
  if (!nextStep) {
    throw new Error('transaction missing nextStep');
  }

  const { relatesTo } = nextStep;
  const activationData = relatesTo?.value?.contextualData?.activationData;

  // Generates a CredentialCreationOptions Object for the Web Auth API to
  // generate a PublicKeyCredential instance for use by IDX to enroll the user/device
  const options = (
    activationData && authenticatorEnrollments?.value
  ) && OktaAuth.webauthn.buildCredentialCreationOptions(
    activationData,
    authenticatorEnrollments.value,
  );

  // Causes a browser prompt enabling the user to select the desired device to
  // enroll in this flow. Generates a Object that contains ClientData (origin, challenge)
  // and attestation (arraybuffer containing authenticator data)
  const result = await navigator.credentials.create(options);
  const attestationResponse = (
    (result as PublicKeyCredential).response as AuthenticatorAttestationResponse
  );

  // converts they arrayBuffer into a string to pass to Idx
  const clientData = binToStr(attestationResponse.clientDataJSON);
  const attestation = binToStr(attestationResponse.attestationObject);

  return { credentials: { clientData, attestation } };
};

/**
 * Uses the Web Authentication API to retrieve credentials for a client to authenticate
 *
 * Used by {@link WebAuthNSubmitButton.tsx} Renderer to initiate the WebAuthN Authentication flow.
 */
export const webAuthNAuthenticationHandler: WebAuthNAuthenticationHandler = async (transaction) => {
  // @ts-ignore OKTA-499928 authenticatorEnrollments missing from rawIdxState
  const { nextStep, rawIdxState: { authenticatorEnrollments } } = transaction;
  // NextStep is guranteed to be available here
  if (!nextStep) {
    throw new Error('transaction missing nextStep');
  }

  const { relatesTo } = nextStep;
  const challengeData = relatesTo?.value?.contextualData?.challengeData;

  // Generates a CredentialRequestOptions Object for the Web Auth API to
  // generate a PublicKeyCredential instance for use by IDX verify the user
  const options = (
    challengeData && authenticatorEnrollments?.value
  ) && OktaAuth.webauthn.buildCredentialRequestOptions(
    challengeData,
    authenticatorEnrollments.value,
  );

  // Triggers a browser prompt allowing the user to provide consent based on the options
  // passed to this method to collect their credentials.
  const credentials = await navigator.credentials.get(options) as PublicKeyCredential;

  // Extracts the key properties from the credentials object and returns.
  // for some reason generic remediator does not allow/expect id field and fails when passed
  return { credentials: omit(OktaAuth.webauthn.getAssertion(credentials), ['id']) };
};

const challengeDataToCredentialRequestOptions = (challengeData: WebAuthNChallengeDataWithUserVerification): PublicKeyCredentialRequestOptions => {
  return {
    ...challengeData,
    challenge: strToBin(challengeData.challenge),
  };
}

function isAuthenticatorAssertionResponse(response: AuthenticatorAssertionResponse | AuthenticatorResponse): response is AuthenticatorAssertionResponse {
  return (response as AuthenticatorAssertionResponse).userHandle instanceof ArrayBuffer;
}

export const webAuthNAutofillActionHandler = async (challengeData: WebAuthNChallengeDataWithUserVerification, abortController: AbortController): Promise<WebAuthNAutofillUICredentials | undefined> => {
  // if the browser doesn't support Passkey autofill and AbortController, no action needs to be taken
  // as there are other steps the user can take to proceed
  const supportsPasskeyAutofill = await isPasskeyAutofillAvailable();
  const supportsAbortController = typeof AbortController !== 'undefined';
  if (supportsPasskeyAutofill && supportsAbortController) {
    try {
      const credential = await navigator.credentials.get({
        mediation: 'conditional',
        publicKey: challengeDataToCredentialRequestOptions(challengeData),
        signal: abortController.signal
      }) as PublicKeyCredential;

      if (isAuthenticatorAssertionResponse(credential.response)) {
        const credentials: WebAuthNAutofillUICredentials = {
          clientData: binToStr(credential.response.clientDataJSON),
          authenticatorData: binToStr(credential.response.authenticatorData),
          signatureData: binToStr(credential.response.signature),
          userHandle: binToStr(credential.response.userHandle as ArrayBuffer),
        };
        return credentials;
      }
    } catch {
      // TODO: OKTA-814898 - add appropriate error handling
    }
  }
}