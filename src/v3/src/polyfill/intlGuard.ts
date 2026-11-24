/*
 * Copyright (c) 2026-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

// OKTA-1325408: EdgeHTML (Chakra) initializes Intl lazily on first access. When that fails
// (e.g. the Windows "British Columbia Standard Time" zone), the first access throws
// "Intl is not available." and later accesses return an empty Intl object. Absorb the one-time
// throw here so the formatjs polyfills see the empty object and install themselves.
// This must stay a separate module imported first: ES imports are hoisted above inline code.
try {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  typeof Intl;
} catch (e) {
  // swallow
}

export {};
