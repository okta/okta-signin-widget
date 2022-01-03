/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */

function getConfig() {
  const orgUrl = process.env.WIDGET_TEST_SERVER
  const a18nAPIKey = process.env.A18N_API_KEY;
  const oktaAPIKey = process.env.OKTA_API_KEY;
  
  const sampleName = process.env.SAMPLE_NAME;
  const config = {
    orgUrl,
    a18nAPIKey,
    oktaAPIKey,
  };

  return Object.assign({}, config);
}

export { getConfig, getSampleConfig, getSampleSpecs, getSampleFeatures };
