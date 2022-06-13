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
import { withTheme } from '@okta/odyssey-react-theme';
import omitBy from 'lodash/omitBy';
import { FunctionComponent, h } from 'preact';
import { useTranslation } from 'react-i18next';
import { ClickEvent } from 'src/types';
import { AuthenticatorOptionValue, CellPropsWithContext, Option } from 'src/types/jsonforms';

import { useWidgetContext } from '../../../contexts';
import { getLabelName } from '../helpers';
import AuthenticatorItem from './AuthenticatorItem';
import { theme } from './AuthenticatorListControl.theme';
import style from './styles.module.css';

const AuthenticatorListControl: FunctionComponent<CellPropsWithContext> = (props) => {
  const { props: { schema, uischema: { label } }, ctx } = props;
  const { t } = useTranslation();
  const {
    setIdxTransaction, authClient, transaction: idxTransaction,
  } = useWidgetContext();
  const keys: string[] = schema?.enum?.map((opt: Option<AuthenticatorOptionValue>) => {
    const {
      id,
      enrollmentId,
      authenticatorId,
      methodType,
    } = opt.value;
    return `${opt.key}-${authenticatorId || ''}${id || ''}${enrollmentId || ''}${methodType || ''}`;
  }) || [];

  const onClick = async (
    event: ClickEvent<HTMLDivElement>,
    index: number,
  ) => {
    event.preventDefault();
    const selectedOpt: Option<AuthenticatorOptionValue> = schema.enum?.[index];
    const authenticator = omitBy({
      id: selectedOpt.value?.id,
      methodType: selectedOpt.value?.methodType,
      enrollmentId: selectedOpt.value?.enrollmentId,
    }, (prop) => prop === undefined);
    const data = ctx?.core?.data;
    const params = omitBy({
      authenticator,
      ...data,
      stateHandle: idxTransaction?.context.stateHandle,
    }, (prop) => prop === undefined);
    const transaction = await authClient.idx.proceed(params);
    setIdxTransaction(transaction);
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

export default withTheme(theme, style)(AuthenticatorListControl);

export const tester = and(
  isEnumControl,
  optionIs('format', 'AuthenticatorList'),
);
