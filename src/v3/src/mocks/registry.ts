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

import { MockedResponse, rest, RestHandler } from 'msw';

type MswRest = typeof rest;
type ScenarioDefinition = (rest: MswRest, response?: MockedResponse) => RestHandler[];

const scenarioRegistry = new Map<string, ScenarioDefinition>();

export const scenario = (mockName: string, scenarioDefinition: ScenarioDefinition): void => {
  scenarioRegistry.set(mockName, scenarioDefinition);
};

export const loadScenario = (scenarioName: string, response?: MockedResponse): RestHandler[] => {
  const scenarioDefinition = scenarioRegistry.get(scenarioName);

  if (scenarioDefinition) {
    // pass `rest` as a parameter to allow us to shim/proxy it in the future
    return scenarioDefinition(rest, response);
  }

  throw new Error(`No MSW scenario with name "${scenarioName}" found!`);
};
