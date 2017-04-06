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

/* globals JSON */
define([
  'okta',
  'vendor/lib/q'
],
function (Okta, Q) {

  function adaptToOkta(promise) {
    return new Q(promise);
  }

  function makeCredential(accountInfo, cryptoParams, challenge) {
    cryptoParams = cryptoParams.map(function (param) {
      return {type: 'FIDO_2_0', algorithm: param.algorithm};
    });

    var promise = window.msCredentials.makeCredential(accountInfo, cryptoParams, challenge)
    .then(function (cred) {
      return Object.freeze({
        credential: {id: cred.id},
        publicKey: JSON.parse(cred.publicKey),
        attestation: cred.attestation
      });
    });

    return adaptToOkta(promise);
  }

  function getAssertion(challenge, allowList) {
    var accept = allowList.map(function (item) {
      return {type: 'FIDO_2_0', id: item.id};
    });
    var filters = {accept: accept};

    var promise = window.msCredentials.getAssertion(challenge, filters)
    .then(function (attestation) {
      var signature = attestation.signature;
      return Object.freeze({
        credential: {id: attestation.id},
        clientData: signature.clientData,
        authenticatorData: signature.authnrData,
        signature: signature.signature
      });
    });

    return adaptToOkta(promise);
  }

  return {
    makeCredential: makeCredential,
    getAssertion: getAssertion,
    isAvailable: function () {
      return window.hasOwnProperty('msCredentials');
    }
  };
});