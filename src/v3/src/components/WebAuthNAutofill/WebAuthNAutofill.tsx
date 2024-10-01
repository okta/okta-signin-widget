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

import { Box } from "@mui/material";
import { h } from "preact";
import { useEffect } from "preact/hooks";

import { useOnSubmit } from "../../hooks";
import { UISchemaElementComponent, WebAuthNAutofillElement } from "../../types";
import { IDX_STEP } from "../../constants";
import { useWidgetContext } from "../../contexts";

const WebAuthNAutofill: UISchemaElementComponent<{
  uischema: WebAuthNAutofillElement;
}> = ({ uischema }) => {
  const { setAbortController } = useWidgetContext();
  const onSubmitHandler = useOnSubmit();
  const { options } = uischema;
  
  const abortController = new AbortController();  

  const executeNextStep = async () => {
    const credentials = await options.getCredentials(abortController);

    if (credentials) {
      onSubmitHandler({
        params: { credentials },
        step: IDX_STEP.CHALLENGE_WEBAUTHN_AUTOFILLUI_AUTHENTICATOR,
        includeData: true,
        // explicitly set the step to render to IDENTIFY
        // because the autofill step doesn't have a proper form to render
        stepToRender: IDX_STEP.IDENTIFY
      });
    }
  };

  useEffect(() => {
    setAbortController(abortController);
    executeNextStep();
    return () => {
      abortController?.abort();
    }
  }, []);

  return <Box display="none" />;
};

export default WebAuthNAutofill;
