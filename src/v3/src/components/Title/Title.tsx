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

import { Box, Typography } from '@okta/odyssey-react-mui';
import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import { TitleElement, UISchemaElementComponent } from '../../types';
import style from './style.css';

const Title: UISchemaElementComponent<{
  uischema: TitleElement
}> = (
  { uischema: { id, options } },
) => {
  const titleRef = useRef<HTMLTitleElement>(null);
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <Box
      display="flex"
      justifyContent="flex-start"
    >
      <Typography
        id={id}
        className={style.noOutline}
        component="h2"
        variant="h4"
        data-se="o-form-head"
        ref={titleRef}
        tabIndex={-1}
      >
        {options?.content}
      </Typography>
    </Box>
  );
};

export default Title;
