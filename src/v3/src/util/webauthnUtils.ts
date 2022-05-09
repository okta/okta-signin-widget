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

import { NextStep, OktaAuth, WebauthnVerificationValues } from '@okta/okta-auth-js';

export const binToStr = (bin: ArrayBuffer): string => btoa(
  new Uint8Array(bin).reduce((s, byte) => s + String.fromCharCode(byte), ''),
);

export const isCredentialsApiAvailable = ():
boolean => !!(navigator && navigator.credentials && navigator.credentials.create);

/**
 * WebAuthNEnrollmentPayload
 */
type WebAuthNEnrollmentPayload = {
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
};

/**
 * Uses the Web Authentication API to generate credentials for enrolling
 * a user into the WebAuthN flow
 *
 * Used by {@link WebauthnControl.ts} Renderer to initiate the WebAuthN Enrollment flow.
 *
 * @param {NextStep} nextStep
 * @return {Promise<WebAuthNEnrollmentPayload>} ClientData & Attestation parameters
 * required by Idx transaction to enroll device
 */
export const webAuthNEnrollmentHandler = async (nextStep: NextStep): Promise<
WebAuthNEnrollmentPayload> => {
  const { authenticator, authenticatorEnrollments } = nextStep;

  // Generates a CredentialCreationOptions Object for the Web Auth API to
  // generate a PublicKeyCredential instance for use by IDX to enroll the user/device
  const options = (
    authenticator?.contextualData?.activationData && authenticatorEnrollments
  ) && OktaAuth.webauthn.buildCredentialCreationOptions(
    authenticator.contextualData.activationData,
    authenticatorEnrollments,
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

  return { clientData, attestation };
};

/**
 * Uses the Web Authentication API to retrieve credentials for a client to authenticate
 *
 * Used by {@link WebauthnControl.ts} Renderer to initiate the WebAuthN Authentication flow.
 *
 * @param {NextStep} nextStep
 * @return {Promise<WebauthnVerificationValues>} ClientData, AuthenticatorData & SignatureData
 * parameters required by Idx transaction to verify a device
 */
export const webAuthNAuthenticationHandler = async (nextStep: NextStep): Promise<
WebauthnVerificationValues> => {
  const { authenticator, authenticatorEnrollments } = nextStep;
  const challengeData = authenticator?.contextualData?.challengeData;

  // Generates a CredentialRequestOptions Object for the Web Auth API to
  // generate a PublicKeyCredential instance for use by IDX verify the user
  const options = (
    challengeData && authenticatorEnrollments
  ) && OktaAuth.webauthn.buildCredentialRequestOptions(
    challengeData,
    authenticatorEnrollments,
  );

  // Triggers a browser prompt allowing the user to provide consent based on the options
  // passed to this method to collect their credentials.
  const credentials = await navigator.credentials.get(options) as PublicKeyCredential;

  // Extracts the key properties from the credentials object and returns.
  return OktaAuth.webauthn.getAssertion(credentials);
};
