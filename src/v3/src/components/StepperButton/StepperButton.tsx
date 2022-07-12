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

import { Button } from '@okta/odyssey-react';
import { h } from 'preact';

import { useWidgetContext } from '../../contexts';
import { useTranslation } from '../../lib/okta-i18n';
import { StepperButtonElement, UISchemaElementComponent } from '../../types';

const StepperButton: UISchemaElementComponent<{
  uischema: StepperButtonElement
}> = ({ uischema }) => {
  const { t } = useTranslation();
  const { setStepperStepIndex } = useWidgetContext();
  const {
    label,
    options: {
      nextStepIndex,
      variant,
    },
  } = uischema;

  const handleClick = () => {
    setStepperStepIndex(nextStepIndex);
  };

  return (
    <Button
      size="m"
      onClick={handleClick}
      variant={variant ?? 'primary'}
      type="button"
      wide
    >
      {t(label as string)}
    </Button>
  );
};

export default StepperButton;
