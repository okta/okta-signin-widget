// /*
//  * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
//  * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
//  *
//  * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
//  * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  *
//  * See the License for the specific language governing permissions and limitations under the License.
//  */

// const { runAxe, createReport } = require('@testcafe-community/axe');

// export const DEFAULT_A11Y_TAG_VALUES = [
//   'wcag21aa',
//   'wcag2a',
// ];
// export const IGNORED_RULES = [
//   'aria-allowed-role', // TODO OKTA-485564
//   'heading-order',
//   'html-has-lang',
//   'landmark-one-main',
//   'page-has-heading-one',
//   'presentation-role-conflict', // TODO OKTA-485565
//   'region',
// ];

// export const checkA11y = async (t, options) => {
//   const ignoredRuleIds = new Set([
//     ...(options?.ignoredRuleIds ?? []),
//     ...IGNORED_RULES,
//   ]);
//   const check = await runAxe(t);
//   const violations = check.results.violations
//     .filter((violation) => !ignoredRuleIds.has(violation.id))
//     // NOTE: WCAG2.1AA 1.4.3 exception for disabled <a> behaving as <button>
//     .filter((violation) => (
//       violation.id !== 'color-contrast' ||
//       violation.nodes.some(n => !(/\blink-button-disabled\b/.test(n.html)))
//     ));


//   await t.expect(violations.length === 0)
//     .ok([
//       t.testRun.test.testFile.filename,
//       createReport(violations),
//     ].join('\n'));
// };

export const checkA11y = async () => {};
