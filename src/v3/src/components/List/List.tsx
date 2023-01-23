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
import { FunctionComponent, h } from 'preact';
import Logger from 'util/Logger';

import {
  ButtonElement,
  DescriptionElement,
  ListElement,
  UISchemaElement,
  UISchemaElementComponent,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../types';
import { getElementKey } from '../../util';
import Button from '../Button';
import InformationalText from '../InformationalText';

const renderLayout = (item: UISchemaLayout) => {
  const { elements } = item;

  return (
    <Box
      display="flex"
      flexDirection="column"
    >
      {
        elements.map((element, index) => {
          return renderElement(element, index);
        })
      }
    </Box>
  )
};

const renderElement = (item: UISchemaElement, index: number) => {
  const elementKey = getElementKey(item, index);
  return (
    <Box
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...(!(item).noMargin && { marginBottom: 4 })}
    >
      {
        (() => {
          switch (item.type) {
          case 'Button':
            return <Button key={elementKey} uischema={item as ButtonElement} />;
          case 'Description':
            return <InformationalText key={elementKey} uischema={item as DescriptionElement} />;
          case UISchemaLayoutType.VERTICAL:
            return renderLayout(item as UISchemaLayout);
          default:
            Logger.warn('Unsupported element type in List: ', item.type);
            return null;
          };
        })()
      }
    </Box>
  );

}

const List: UISchemaElementComponent<{
  uischema: ListElement
}> = ({ uischema }) => {
  const { options } = uischema;

  return options.items?.length ? (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      marginBottom={4}
    >
      { options.description && <Typography component="p">{options.description}</Typography> }
      <ListOdyssey listType={options.type ?? 'unordered'}>
        {
          options.items.map((item: string | UISchemaLayout) => (
            <ListOdyssey.Item>
              {typeof item === 'string' ? item : renderLayout(item) }
            </ListOdyssey.Item>
          ))
        }
      </ListOdyssey>
    </Box>
  ) : null;
};

export default List;
