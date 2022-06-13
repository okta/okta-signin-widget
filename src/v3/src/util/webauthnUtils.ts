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

// TODO: use OktaAuth.webauthn instead
import { OktaAuth, WebauthnVerificationValues } from '@okta/okta-auth-js';
import omit from 'lodash/omit';
import { IdxTransactionWithNextStep } from 'src/types';

export const binToStr = (bin: ArrayBuffer): string => btoa(
  new Uint8Array(bin).reduce((s, byte) => s + String.fromCharCode(byte), ''),
);

export const isCredentialsApiAvailable = ():
boolean => !!(navigator && navigator.credentials && navigator.credentials.create);

/**
 * WebAuthNEnrollmentPayload
 */
type WebAuthNEnrollmentPayload = {
  credentials: {
    /**
     * Represents the client data that was passed
     * to CredentialsContainer.create()
     */
    clientData: string;
    /**
     * BtoA String containing authenticator data and an attestation statement
     * for a newly-created key pair.
     */
    attestation: string;
  }
};

/**
 * WebAuthNVerificationPayload
 */
type WebAuthNVerificationPayload = {
  credentials: WebauthnVerificationValues
};

/**
 * Uses the Web Authentication API to generate credentials for enrolling
 * a user into the WebAuthN flow
 *
 * Used by {@link WebauthnControl.tsx} Renderer to initiate the WebAuthN Enrollment flow.
 *
 * @param {IdxTransactionWithNextStep} transaction
 * @return {Promise<WebAuthNEnrollmentPayload>} ClientData & Attestation parameters
 * required by Idx transaction to enroll device
 */
export const webAuthNEnrollmentHandler = async (transaction: IdxTransactionWithNextStep): Promise<
WebAuthNEnrollmentPayload> => {
  // @ts-ignore OKTA-499928 authenticatorEnrollments missing from rawIdxState
  const { nextStep, rawIdxState: { authenticatorEnrollments } } = transaction;
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
 * Used by {@link WebauthnControl.tsx} Renderer to initiate the WebAuthN Authentication flow.
 *
 * @param {IdxTransactionWithNextStep} transaction
 * @return {Promise<WebAuthNVerificationPayload>} ClientData, AuthenticatorData & SignatureData
 * parameters required by Idx transaction to verify a device
 */
export const webAuthNAuthenticationHandler = async (transaction: IdxTransactionWithNextStep):
Promise<WebAuthNVerificationPayload> => {
  // @ts-ignore OKTA-499928 authenticatorEnrollments missing from rawIdxState
  const { nextStep, rawIdxState: { authenticatorEnrollments } } = transaction;
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
