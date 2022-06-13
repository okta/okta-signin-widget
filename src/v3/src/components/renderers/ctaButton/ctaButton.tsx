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

import { RendererProps, UISchemaElement } from '@jsonforms/core';
import { Box, Button } from '@okta/odyssey-react';
import { FunctionComponent, h } from 'preact';
import { useTranslation } from 'react-i18next';
import { ClickHandler } from 'src/types';

import { useWidgetContext } from '../../../contexts';

const CTAButton: FunctionComponent<RendererProps> = ({
  uischema,
}) => {
  const { t } = useTranslation();
  const { setIdxTransaction } = useWidgetContext();
  const {
    action, type, variant, id, text,
  } = (uischema.options as UISchemaElement['options'])!;

  const handleClick: ClickHandler = async (e) => {
    e.preventDefault();

    const transaction = await action();
    setIdxTransaction!(transaction);
  };

  return (
    // @ts-ignore OKTA-471233
    <Box marginTop="m">
      <Button
        data-testid={id}
        size="m"
        type={type ?? 'button'}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(type !== 'submit' && { onClick: handleClick })}
        variant={variant ?? 'primary'}
        wide
      >
        {t(text)}
      </Button>
    </Box>
  );
};

export default CTAButton;
