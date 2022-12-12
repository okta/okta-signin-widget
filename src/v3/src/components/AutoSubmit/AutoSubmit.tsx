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

import { useEffect } from 'preact/hooks';

import { useOnSubmit } from '../../hooks';
import { AutoSubmitElement, UISchemaElementComponent } from '../../types';

const AutoSubmit: UISchemaElementComponent<{ uischema: AutoSubmitElement }> = ({
  uischema: { options },
}) => {
  const onSubmitHandler = useOnSubmit();

  useEffect(() => {
    // we only want this to ever happen once (on initial component mount)
    onSubmitHandler({
      params: options.actionParams,
      includeData: options.includeData,
      isActionStep: options.isActionStep,
      step: options.step,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default AutoSubmit;
