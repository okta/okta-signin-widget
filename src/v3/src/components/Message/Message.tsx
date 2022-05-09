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

import { IdxStatus } from '@okta/okta-auth-js';
import { FunctionComponent, h } from 'preact';

type MessageProps = {
  type: IdxStatus,
  message: string,
  // eslint-disable-next-line react/require-default-props
  i18n?: string | null,
};

export const Message: FunctionComponent<MessageProps> = ({
  i18n = null,
  message,
  type,
}: MessageProps) => (
  <div role="alert">
    <span>{ type }</span>
    <p>
      { i18n ?? message }
    </p>
  </div>
);

export default Message;
