/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import Q from 'q';
import FidoUtil from 'util/FidoUtil';

function adaptToOkta(promise) {
  return new Q(promise);
}

function makeCredential(accountInfo, cryptoParams, challenge) {
  cryptoParams = cryptoParams.map(function(param) {
    return { type: 'FIDO_2_0', algorithm: param.algorithm };
  });

  const promise = window.msCredentials.makeCredential(accountInfo, cryptoParams, challenge).then(function(cred) {
    return Object.freeze({
      credential: { id: cred.id },
      publicKey: JSON.parse(cred.publicKey),
      attestation: cred.attestation,
    });
  });

  return adaptToOkta(promise);
}

function getAssertion(challenge, allowList) {
  const accept = allowList.map(function(item) {
    return { type: 'FIDO_2_0', id: item.id };
  });
  const filters = { accept: accept };
  const promise = window.msCredentials.getAssertion(challenge, filters).then(function(attestation) {
    const signature = attestation.signature;

    return Object.freeze({
      credential: { id: attestation.id },
      clientData: signature.clientData,
      authenticatorData: signature.authnrData,
      signature: signature.signature,
    });
  });

  return adaptToOkta(promise);
}

function processWebAuthnResponse(inputFunction, context) {
  if (typeof inputFunction === 'undefined') {
    return null;
  }
  const responseValue = inputFunction.apply(context);
  if (responseValue === undefined || responseValue === null) {
    return null;
  }
  return JSON.stringify(responseValue);
}

export default {
  makeCredential: makeCredential,
  getAssertion: getAssertion,
  processWebAuthnResponse: processWebAuthnResponse,
  isAvailable: function() {
    return Object.prototype.hasOwnProperty.call(window, 'msCredentials');
  },
  isNewApiAvailable: function() {
    // navigator.credentials is not supported in IE11
    // eslint-disable-next-line compat/compat
    return navigator && navigator.credentials && navigator.credentials.create;
  },
  isWebauthnOrU2fAvailable: function() {
    return this.isNewApiAvailable() || FidoUtil.isU2fAvailable();
  },
};
