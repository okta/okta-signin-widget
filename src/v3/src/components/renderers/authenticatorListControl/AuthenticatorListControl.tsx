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
  and,
  isEnumControl,
  optionIs,
} from '@jsonforms/core';
import { Box, Text } from '@okta/odyssey-react';
import { FunctionComponent, h } from 'preact';
import { useTranslation } from 'react-i18next';
import { ClickEvent } from 'src/types';
import { AuthenticatorOptionValue, CellPropsWithContext, Option } from 'src/types/jsonforms';

import { getLabelName } from '../helpers';
import AuthenticatorItem from './AuthenticatorItem';
import style from './styles.scss';

const AuthenticatorListControl: FunctionComponent<CellPropsWithContext> = (props) => {
  const { props: { schema, config, uischema: { label } }, ctx } = props;
  const { t } = useTranslation();
  const keys: string[] = schema?.enum?.map((opt: Option<AuthenticatorOptionValue>) => {
    const {
      id,
      key,
      enrollmentId,
      authenticatorId,
    } = opt.value;
    return `${key}-${authenticatorId || ''}${id || ''}${enrollmentId || ''}`;
  }) || [];
  const onClick = (
    event: ClickEvent<HTMLDivElement>,
    index: number,
  ) => {
    event.preventDefault();
    const authenticator = schema?.enum?.[index]?.value?.key;
    if (config.proceed && authenticator) {
      const data = ctx?.core?.data;
      config.proceed({ params: { authenticator, ...data } });
    }
  };

  return (
    // @ts-ignore:next-line OKTA-471233
    <Box width="full">
      { schema.enum && (
        // @ts-ignore:next-line OKTA-471233
        <Box width="full">
          <Text as="p">
            <Text as="strong">{getLabelName(t(label as string))}</Text>
          </Text>
          {
            schema.enum.map((option: Option<AuthenticatorOptionValue>, index) => (
              // Ignore ts error caused by preact while using Box component
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore:next-line
              <Box
                hoverBorderColor="primary"
                borderColor="display"
                borderRadius="base"
                boxShadow="default"
                className={style.authButton}
                marginTop="m"
                key={keys[index]}
                role="button"
                tabIndex={0}
                onKeyPress={
                  (event: ClickEvent<HTMLDivElement>) => onClick(event, index)
                }
                onClick={(event: ClickEvent<HTMLDivElement>) => onClick(event, index)}
              >
                <AuthenticatorItem
                  option={option}
                />
              </Box>

            ))
          }
        </Box>
      )}
    </Box>
  );
};

export default AuthenticatorListControl;

export const tester = and(
  isEnumControl,
  optionIs('format', 'AuthenticatorList'),
  (_, schema) => schema?.properties?.authenticator?.type === 'object',
);
