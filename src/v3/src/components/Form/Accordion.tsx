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
} from '@mui/material';
import MuiAccordion from '@mui/material/Accordion';
import { styled } from '@mui/material/styles';
import { useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { Box, Typography } from '@okta/odyssey-react-mui-legacy';
import { FunctionComponent, h } from 'preact';

import { AccordionLayout } from '../../types';
import LayoutContainer from './LayoutContainer';

type AccordionProps = {
  uischema: AccordionLayout;
};

const StyledAccordionSummary = styled((props: AccordionSummaryProps) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <AccordionSummary {...props} />
))(() => {
  const tokens = useOdysseyDesignTokens();
  return ({
    padding: 0,
    width: 'fit-content',
    '& .MuiAccordionSummary-content': {
      margin: 0,
      color: tokens.PalettePrimaryMain,
      '&:hover': {
        textDecoration: 'underline',
        textDecorationColor: tokens.PalettePrimaryMain,
      },
    },
  });
});

const Accordion: FunctionComponent<AccordionProps> = ({ uischema }) => {
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
              <LayoutContainer uischema={element.options.content} />
            </AccordionDetails>
          </MuiAccordion>
        ))
      }
    </Box>
  );
};

export default Accordion;
