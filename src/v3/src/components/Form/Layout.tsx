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
  AccordionDetails,
  AccordionSummary,
  AccordionSummaryProps,
  Box,
  Typography,
} from '@mui/material';
import MuiAccordion from '@mui/material/Accordion';
import { styled } from '@mui/material/styles';
import { FunctionComponent, h } from 'preact';

import {
  AccordionLayout,
  FieldElement,
  StepperLayout,
  UISchemaElement,
  UISchemaElementComponent,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../types';
import { isDevelopmentEnvironment, isTestEnvironment } from '../../util';
import renderers from './renderers';
// eslint-disable-next-line import/no-cycle
import Stepper from './Stepper';

const getElementKey = (element: UISchemaElement, index: number): string => {
  const defaultKey = [element.type, element.key, index].join('_');
  return element.type === 'Field' && (element as FieldElement).key
    ? [(element as FieldElement).key].join('_')
    : defaultKey;
};

type LayoutProps = {
  uischema: UISchemaLayout;
};

type StyledAccordionProps = {
  uischema: AccordionLayout;
};

const StyledAccordionSummary = styled((props: AccordionSummaryProps) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <AccordionSummary {...props} />
))(({ theme }) => ({
  padding: 0,
  width: 'fit-content',
  '& .MuiAccordionSummary-content': {
    // marginLeft: theme.spacing(1),
    margin: 0,
    color: theme.palette.primary.main,
    '&:hover': {
      textDecoration: 'underline',
      textDecorationColor: theme.palette.primary.main,
    },
  },
}));

const Accordion: FunctionComponent<StyledAccordionProps> = ({ uischema }) => {
  const { elements } = uischema;

  return (
    <Box>
      {
        elements.map((element) => (
          <MuiAccordion
            key={element.key}
            disableGutters
            elevation={0}
          >
            <StyledAccordionSummary
              aria-controls={`${element.options.id}-content`}
              id={`${element.options.id}-header`}
            >
              <Typography>{element.options.summary}</Typography>
            </StyledAccordionSummary>
            <AccordionDetails sx={{ padding: 0 }}>
              {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
              <Layout uischema={element.options.content} />
            </AccordionDetails>
          </MuiAccordion>
        ))
      }
    </Box>
  );
};

const Layout: FunctionComponent<LayoutProps> = ({ uischema }) => {
  const { type, elements } = uischema;

  const isHorizontalLayout = type === UISchemaLayoutType.HORIZONTAL;
  const flexDirection = isHorizontalLayout ? 'row' : 'column';
  return (
    <Box
      display="flex"
      flexDirection={flexDirection}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...(isHorizontalLayout && { gap: 1 })}
    >
      {
        elements.map((element, index) => {
          const elementKey = getElementKey(element, index);

          if (element.type === UISchemaLayoutType.STEPPER) {
            return (
              <Stepper
                key={elementKey}
                uischema={element as StepperLayout}
              />
            );
          }

          if (element.type === UISchemaLayoutType.ACCORDION) {
            return (
              <Accordion
                key={elementKey}
                uischema={element as AccordionLayout}
              />
            );
          }

          if ([UISchemaLayoutType.HORIZONTAL, UISchemaLayoutType.VERTICAL]
            .includes((element as UISchemaLayout).type)) {
            return (
              <Layout
                key={elementKey}
                uischema={element as UISchemaLayout}
              />
            );
          }

          const renderer = renderers.find((r) => r.tester(element));
          if (!renderer) {
            // TODO: for now do not render for unmatch render object
            // remove unnecessary uischema in future refactor and throw error
            // throw new Error(`Failed to find render component for uischema: ${JSON.stringify(element)}`);
            if (isDevelopmentEnvironment() || isTestEnvironment()) {
              console.warn(`Failed to find render component for uischema: ${JSON.stringify(element)}`);
            }
            return null;
          }

          const uischemaElement = (element as UISchemaElement);
          const Component = renderer.renderer as UISchemaElementComponent;
          return (
            <Box
              key={elementKey}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...(!(uischemaElement).noMargin && { marginBottom: 4 })}
            >
              <Component uischema={uischemaElement} />
            </Box>
          );
        })
      }
    </Box>
  );
};

export default Layout;
