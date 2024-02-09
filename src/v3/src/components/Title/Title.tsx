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

import { Box } from '@mui/material';
import { Typography } from '@okta/odyssey-react-mui';
import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import { useWidgetContext } from '../../contexts';
import { TitleElement, UISchemaElementComponent } from '../../types';

const Title: UISchemaElementComponent<{
  uischema: TitleElement
}> = (
  { uischema: { options } },
) => {
  const titleRef = useRef<HTMLTitleElement>(null);
  const { widgetProps } = useWidgetContext();
  const { features: { autoFocus = false } = {} } = widgetProps;

  useEffect(() => {
    if (!autoFocus) {
      titleRef.current?.focus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      display="flex"
      justifyContent="flex-start"
    >
      <Typography
        component="h2"
        variant="h4"
        testId="o-form-head"
        typographyRef={titleRef}
      >
        {options.content}
      </Typography>
    </Box>
  );
};

export default Title;
