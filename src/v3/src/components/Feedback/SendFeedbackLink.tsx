/*
 * Copyright (c) 2025-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import {
  Box,
  Link as OdyLink,
  OdysseyThemeProvider,
  useOdysseyDesignTokens,
} from '@okta/odyssey-react-mui';
import { h } from 'preact';
import { useCallback, useState } from 'preact/hooks';

import { useSendFeedback } from '../../hooks';
import { loc } from '../../util';
import { SendFeedbackDialog } from './SendFeedbackDialog';

/**
 * Persistent "Send feedback" trigger shown at the bottom of normal SIW steps
 * (every step EXCEPT the crash/terminal UI, which has its own inline report
 * form). Renders nothing unless feedback is enabled. Opens {@link SendFeedbackDialog}.
 *
 * Portal scoping: Odyssey's component style overrides are stylis-scoped under
 * `#okta-sign-in` (see util/stylisPlugins), but a MUI Dialog portals to
 * document.body by default — outside that scope — so the dialog renders with
 * MUI defaults (no padding/typography). The widget's top-level
 * OdysseyProvider.shadowRootElement is a boolean placeholder, so it does not
 * redirect the portal. We fix it locally: render a container node inside `#okta-sign-in`
 * and wrap the Dialog in a nested OdysseyThemeProvider whose `shadowRootElement`
 * is that node. OdysseyThemeProvider only rebuilds the theme (reusing the parent
 * emotion cache + stylis scope) and sets MuiDialog's `container` to our node, so
 * the dialog portals back inside the scope and the overrides match.
 */
export const SendFeedbackLink = (): h.JSX.Element | null => {
  const tokens = useOdysseyDesignTokens();
  const { enabled } = useSendFeedback();
  const [isOpen, setIsOpen] = useState(false);
  const [dialogContainer, setDialogContainer] = useState<HTMLElement | null>(null);

  const open = useCallback((e: h.JSX.TargetedMouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  if (!enabled) {
    return null;
  }

  return (
    <Box
      marginBlockStart={tokens.Spacing4}
      data-se="send-feedback"
    >
      <OdyLink
        href="#"
        onClick={open}
        testId="send-feedback-link"
      >
        {loc('feedback.sendFeedback', 'login')}
      </OdyLink>
      {/* Portal target kept inside #okta-sign-in so the scoped Odyssey overrides
          apply to the portaled dialog. */}
      <div
        ref={setDialogContainer}
        data-se="feedback-dialog-container"
      />
      {dialogContainer && (
        <OdysseyThemeProvider shadowRootElement={dialogContainer}>
          <SendFeedbackDialog
            isOpen={isOpen}
            onClose={close}
          />
        </OdysseyThemeProvider>
      )}
    </Box>
  );
};
