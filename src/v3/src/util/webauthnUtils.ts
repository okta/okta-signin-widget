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

import { WebAuthNAuthenticationHandler, WebAuthNEnrollmentHandler } from '../types';

export const binToStr = (bin: ArrayBuffer): string => btoa(
  new Uint8Array(bin).reduce((s, byte) => s + String.fromCharCode(byte), ''),
);

export const isCredentialsApiAvailable = ():
boolean => !!(navigator && navigator.credentials && navigator.credentials.create);

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
