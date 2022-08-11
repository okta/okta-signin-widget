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
import { h } from 'preact';

import { useOnSubmit } from '../../hooks';
import {
  TextWithHtmlElement,
  UISchemaElementComponent,
} from '../../types';

const TextWithHtml: UISchemaElementComponent<{
  uischema: TextWithHtmlElement
}> = ({ uischema }) => {
  const {
    content,
    actionParams,
    step,
    stepToRender,
    className,
    isActionStep,
  } = uischema.options;
  const onSubmitHandler = useOnSubmit();

  const handleClick = async (e: Event) => {
    e.preventDefault();

    // only submit when className matches
    if ((e.target as HTMLElement).className.includes(className)) {
      onSubmitHandler({
        step,
        stepToRender,
        params: actionParams,
        isActionStep,
      });
    }
  };

  return (
    <Box>
      <Box
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </Box>
  );
};

export default TextWithHtml;
