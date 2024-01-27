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

import { Link } from '@okta/odyssey-react-mui';
import { h } from 'preact';

import { useStepperContext, useWidgetContext } from '../../contexts';
import { useAutoFocus } from '../../hooks';
import { ClickHandler, StepperLinkElement, UISchemaElementComponent } from '../../types';

const StepperLink: UISchemaElementComponent<{
  uischema: StepperLinkElement
}> = ({ uischema }) => {
  const { setStepIndex } = useStepperContext();
  const {
    label,
    focus,
    options: {
      dataSe,
      nextStepIndex,
    },
  } = uischema;

  const focusRef = useAutoFocus<HTMLButtonElement>(focus);
  const widgetContext = useWidgetContext();

  const handleClick: ClickHandler = (e) => {
    e.preventDefault();

    if (typeof nextStepIndex === 'function') {
      setStepIndex(nextStepIndex(widgetContext));
    } else {
      setStepIndex(nextStepIndex);
    }
    
    return;
  };

  return (
    <Link
      href=""
      onClick={handleClick}
      linkFocusRef={focusRef}
      testId={dataSe}
    >
      {label}
    </Link>
  );
};

export default StepperLink;
