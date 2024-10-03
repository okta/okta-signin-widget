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

const WebAuthNAutofill: UISchemaElementComponent<{
  uischema: WebAuthNAutofillElement;
}> = ({ uischema }) => {
  const { options } = uischema;

  const onSubmitHandler = useOnSubmit();

  const executeNextStep = async () => {
    const credentials = await options.onClick();
    if (credentials) {
      onSubmitHandler({
        params: { credentials },
        step: IDX_STEP.CHALLENGE_WEBAUTHN_AUTOFILLUI_AUTHENTICATOR,
        includeData: true
      });
    }
  };

  useEffect(() => {
    executeNextStep();
  }, []);

  return <Box display="none" />;
};

export default WebAuthNAutofill;
