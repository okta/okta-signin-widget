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

import { shouldHideIdentifier } from 'src/util';

import { IdentifierContainerElement, TransformStepFnWithOptions } from '../../types';
import { traverseLayout } from '../util';

export const createIdentifierContainer: TransformStepFnWithOptions = ({
  transaction,
  widgetProps,
}) => (formbag) => {
  const transactionIdentifier: string | undefined = transaction
    ?.context?.user?.value?.identifier as string;
  const { features } = widgetProps;
  let hasIdentifierContainer = false;

  // Traverse existing layout and check for existing IdentifierContainers
  traverseLayout({
    layout: formbag.uischema,
    predicate: (el) => (el.type === 'IdentifierContainer'),
    callback: (_) => {
      hasIdentifierContainer = true;
    },
  });

  // If we don't find an IdentifierContainer that has been added by a custom transformer, add an
  // IdentifierContainer at the top of the layout if there is an identifier in the transaction
  if (!hasIdentifierContainer && !shouldHideIdentifier(
    features?.showIdentifier,
    transactionIdentifier,
    transaction.nextStep?.name,
  )) {
    const identifierContainer: IdentifierContainerElement = {
      type: 'IdentifierContainer',
      options: {
        identifier: transactionIdentifier,
      },
    };
    formbag.uischema.elements.unshift(identifierContainer);
  }

  return formbag;
};
