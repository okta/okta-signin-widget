/*!
 * Copyright (c) 2025, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/**
 * Resolves after `ms` milliseconds. Native replacement for the deprecated
 * `Q.delay`. Exposed as a method on a default-exported object (rather than a
 * bare named export) so tests can `spyOn(DelayUtil, 'delay')` to fast-forward
 * timing - mirroring how `Q.delay` used to be mocked.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default { delay };
