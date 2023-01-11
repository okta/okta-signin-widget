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

import { List as ListOdyssey } from '@okta/odyssey-react';
import { Box, Typography } from '@okta/odyssey-react-mui';
import { h } from 'preact';

import { ListElement, UISchemaElementComponent, UISchemaLayout } from '../../types';
import Layout from '../Form/Layout';

const List: UISchemaElementComponent<{
  uischema: ListElement
}> = ({ uischema }) => {
  const { options } = uischema;

  return options.items?.length ? (
    <Box
      display="flex"
      justifyContent="flex-start"
      marginBottom={4}
    >
      { options.description && <Typography component="p">{options.description}</Typography> }
      <ListOdyssey listType={options.type ?? 'unordered'}>
        {
          options.items.map((item: string | UISchemaLayout) => (
            <ListOdyssey.Item>
              {typeof item === 'string' ? item : <Layout uischema={item} /> }
            </ListOdyssey.Item>
          ))
        }
      </ListOdyssey>
    </Box>
  ) : null;
};

export default List;
