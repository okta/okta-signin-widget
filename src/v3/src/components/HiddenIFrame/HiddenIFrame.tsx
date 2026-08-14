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
import { FunctionComponent, h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

// TEMPORARY DEBUG — OKTA-1250822. Remove with util/nfcDebug.ts.
import { nfcDebugLog } from '../../util/nfcDebug';

type HiddenIFrameProps = {
  id?: string;
  src: string;
};
const HiddenIFrame: FunctionComponent<HiddenIFrameProps> = ({ id, src }) => {
  // TEMPORARY DEBUG — OKTA-1250822.
  // A fresh MOUNT means the iframe node was (re)created => the custom-uri deep link
  // re-fires. A later SRC-CHANGE with NO intervening MOUNT means Preact reused the
  // existing iframe node (key unchanged) => updating src alone does NOT re-fire the
  // navigation. That "SRC changed (node reused)" line is the decisive bug signature.
  const isFirstSrcEffect = useRef(true);
  useEffect(() => {
    nfcDebugLog('HiddenIFrame MOUNT (node created => deep link fires)', { id, src });
    return () => nfcDebugLog('HiddenIFrame UNMOUNT (node destroyed)', { id, src });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    // Skip the initial run (that is the mount, already logged above). Only a genuine
    // later src change on a reused node should log here — the reconciliation-reuse bug.
    if (isFirstSrcEffect.current) {
      isFirstSrcEffect.current = false;
      return;
    }
    nfcDebugLog('HiddenIFrame SRC changed on REUSED node (deep link NOT re-fired => BUG)', { id, src });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return (
    <Box
      id={id}
      component="iframe"
      src={src}
      sx={{
        display: 'none',
      }}
    />
  );
};

export default HiddenIFrame;
