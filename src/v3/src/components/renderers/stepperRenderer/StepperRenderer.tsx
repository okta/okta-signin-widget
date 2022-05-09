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
import { useEffect, useState } from 'preact/hooks';
import { useTranslation } from 'react-i18next';
import { ClickEvent } from 'src/types';

enum NavDirection {
  NEXT,
  PREV,
}
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
  const isPrevStepAvailable = () => (uischema.options?.navButtonsConfig?.prev && activeStepIdx > 0);

  const handleNavClick = (event: ClickEvent, direction: NavDirection) => {
    event.preventDefault();
    if (direction === NavDirection.NEXT) {
      setActiveStepIdx(activeStepIdx + 1);
    } else {
      setActiveStepIdx(activeStepIdx - 1);
    }
  };

  useEffect(() => {
    // this forces the Stepper to re-render and reset the steps
    setActiveStepIdx(0);
  }, [uischema.options?.key]);

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
      {isPrevStepAvailable()
        && (
        // @ts-ignore OKTA-1234
        <Box marginTop="m">
          <Button
            size="m"
            onClick={(e: ClickEvent) => handleNavClick(e, NavDirection.PREV)}
            variant={uischema.options?.navButtonsConfig?.prev?.variant ?? 'primary'}
            wide
          >
            {
              t(
                uischema.options?.navButtonsConfig?.prev?.label
                  ?? 'renderers.stepper.navigation.button.prev',
              )
            }
          </Button>
        </Box>
        )}
      {isNextStepAvailable()
        && (
        // @ts-ignore OKTA-1234
        <Box marginTop="m">
          <Button
            size="m"
            onClick={(e: ClickEvent) => handleNavClick(e, NavDirection.NEXT)}
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
