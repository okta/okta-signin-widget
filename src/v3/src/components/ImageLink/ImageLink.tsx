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
import { Link } from '@okta/odyssey-react-mui';
import { ImageLinkElement, UISchemaElementComponent } from 'src/types';

const ImageLink: UISchemaElementComponent<{
  uischema: ImageLinkElement
}> = ({ uischema }) => {
  const { options } = uischema;

  return (
    <Box>
      <Link
        href={options.url}
        rel="noopener noreferrer"
        ariaLabel={options.altText}
        className={options.linkClassName}
      >
        <Box
          component="img"
          src={options.imageSrc}
          alt={options.altText}
          sx={{ width: options.width, height: options.height }}
        />
      </Link>
    </Box>
  );
};

export default ImageLink;