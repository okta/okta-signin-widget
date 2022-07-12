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

import { Box, Heading as HeadingOdyssey } from '@okta/odyssey-react';
import { h } from 'preact';
import { useTranslation } from 'react-i18next';
import { HeadingElement, UISchemaElementComponent } from 'src/types';

const Heading: UISchemaElementComponent<{
  uischema: HeadingElement
}> = ({ uischema }) => {
  const { t } = useTranslation();
  const { options } = uischema;
  const textContent = t(options.content, options.contentParams);

  return (
    // @ts-ignore OKTA-471233
    <Box
      display="flex"
      justifyContent="flex-start"
      marginBottom="s"
    >
      <HeadingOdyssey
        level={options?.level ?? '2'}
        visualLevel={options?.visualLevel ?? '3'}
      >
        {textContent}
      </HeadingOdyssey>
    </Box>
  );
};

export default Heading;
