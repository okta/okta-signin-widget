/*
 * Copyright (c) 2025-present, Okta, Inc. and/or its affiliates. All rights reserved.
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
 * Public Okta legal URLs linked from the feedback consent text. Kept here so
 * both feedback surfaces (crash form + dialog) share one source of truth.
 */
export const OKTA_PRIVACY_POLICY_URL = 'https://www.okta.com/legal/privacy-policy/';
export const OKTA_MASTER_SUBSCRIPTION_AGREEMENT_URL = 'https://www.okta.com/legal/';

/**
 * Sentry Session Replay (rrweb) doesn't record mutations of elements carrying
 * this attribute. Set on the feedback UI elements whose inline `style` MUI
 * rewrites from script (dialog fades, scroll lock, the multiline field's
 * autosize): to diff a style change, rrweb calls `setAttribute('style', oldValue)`
 * on a scratch element, which the sign-in page CSP (`style-src` with a nonce)
 * blocks and reports. rrweb checks the mutated element itself, not its
 * ancestors, so each one needs it. These elements show as blank placeholders in
 * the replay.
 */
export const REPLAY_BLOCK_ATTRIBUTE = 'data-sentry-block';
export const REPLAY_BLOCK_ATTRIBUTES = { [REPLAY_BLOCK_ATTRIBUTE]: '' } as const;
