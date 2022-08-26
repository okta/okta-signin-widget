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

import { AxeCheck, axeCheck, createReport } from '@testcafe-community/axe';
import { TagValue } from 'axe-core';

const DEFAULT_A11Y_TAG_VALUES: TagValue[] = [
  'best-practice',
  'wcag21aa',
  'wcag2a',
  // The below tags cause a color contrast issue on MUI input field
  // 'cat.color',
  // 'wcag2aa',
  // 'wcag143',
];
const ALWAYS_IGNORED_RULE_IDS: string[] = [
  'landmark-one-main',
  'page-has-heading-one',
  'presentation-role-conflict', // TODO OKTA-485565
  'aria-allowed-role', // TODO OKTA-485564
];

interface A11yCheckOptions {
  tagValues?: TagValue[],
  ignoredRuleIds?: string[],
}

const checkA11y = async (
  testController: TestController,
  options?: A11yCheckOptions,
): Promise<AxeCheck> => {
  const ignoredRuleIds: Set<string> = new Set([
    ...(options?.ignoredRuleIds ?? []),
    ...ALWAYS_IGNORED_RULE_IDS,
  ]);
  const axeOptions = {
    runOnly: {
      type: 'tag' as const,
      values: options?.tagValues || DEFAULT_A11Y_TAG_VALUES,
    },
    rules: {
      // skipping the "document-title" rule as there is an issue with testcafe
      // being unable to find the title of a page inside the <head> tag.
      // @see https://github.com/testcafe-community/axe/blob/c3f547ee93e2bbc4c957bcd4d28950e36163b46e/index.js#L58-L59
      'document-title': false,
    },
  };

  const { error, results } = await axeCheck(testController, undefined, axeOptions);

  await testController.expect(error).notOk();

  results.violations = results.violations
    .filter((violation) => !ignoredRuleIds.has(violation.id));

  return testController
    .expect(results.violations.length === 0)
    .ok(createReport(results.violations));
};

export { checkA11y, DEFAULT_A11Y_TAG_VALUES };
