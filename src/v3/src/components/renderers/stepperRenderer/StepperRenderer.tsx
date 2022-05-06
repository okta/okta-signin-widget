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

import {
  Layout,
  LayoutProps,
} from '@jsonforms/core';
import { ResolvedJsonFormsDispatch, withJsonFormsLayoutProps } from '@jsonforms/react';
import { VanillaRendererProps, withVanillaControlProps } from '@jsonforms/vanilla-renderers';
import { Box, Button } from '@okta/odyssey-react';
import { FunctionComponent, h } from 'preact';
import { useState } from 'preact/hooks';
import { useTranslation } from 'react-i18next';
import { ClickEvent } from 'src/types';

type CategorizationProps = LayoutProps & VanillaRendererProps;
const StepperRenderer: FunctionComponent<CategorizationProps> = (props) => {
  const { t } = useTranslation();
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const {
    uischema,
    schema,
    path,
    visible,
    renderers,
    cells,
  } = props;

  const isNextStepAvailable = () => (activeStepIdx < (uischema as Layout).elements.length - 1);

  const handleClick = (event: ClickEvent) => {
    event.preventDefault();
    setActiveStepIdx(activeStepIdx + 1);
  };

  return visible ? (
    // @ts-ignore OKTA-1234
    <Box>
      {
        (uischema as Layout).elements.map((child, index) => (
          activeStepIdx === index && (
            <ResolvedJsonFormsDispatch
              schema={schema}
              uischema={child}
              path={path}
              enabled
              renderers={renderers}
              cells={cells}
              key={child.type}
            />
          )
        ))
      }
      {isNextStepAvailable()
        && (
        // @ts-ignore OKTA-1234
        <Box marginBottom="m">
          <Button
            size="m"
            onClick={handleClick}
            variant={uischema.options?.navButtonsConfig?.next?.variant ?? 'primary'}
            wide
          >
            {
              t(
                uischema.options?.navButtonsConfig?.next?.label
                  ?? 'oform.next',
              )
            }
          </Button>
        </Box>
        )}
    </Box>
  ) : null;
};

export default withVanillaControlProps(withJsonFormsLayoutProps(StepperRenderer));
