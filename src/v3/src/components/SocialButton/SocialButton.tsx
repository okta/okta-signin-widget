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

import { Box, Button } from '@okta/odyssey-react';
import { FunctionComponent, h } from 'preact';
import { ClickHandler } from 'src/types';

import style from './style.css';

type SocialProps = {
  Icon: FunctionComponent,
  authenticator: string,
  onClick: ClickHandler,
  text: string,
};

const SocialButton: FunctionComponent<SocialProps> = ({
  Icon,
  authenticator,
  onClick,
  text,
}: SocialProps) => (
  // @ts-ignore OKTA-471233
  <Box
    className={style.socialButton}
    marginTop="m"
  >
    <Button
      type="button"
      variant="secondary"
      key={authenticator}
      icon={
        <Icon />
      }
      onClick={onClick}
      size="m"
      wide
    >
      {text}
    </Button>
  </Box>
);

export default SocialButton;
