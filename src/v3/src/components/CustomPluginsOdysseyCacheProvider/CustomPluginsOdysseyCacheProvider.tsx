/*
 * Copyright (c) 2023-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import createCache, { StylisPlugin } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { memo, ReactElement, useMemo } from 'preact/compat';
import { prefixer } from 'stylis';

import logical from '../../../stylis-logical-plugin/src';

declare global {
  interface Window {
    cspNonce: string;
  }
}

const createUniqueAlphabeticalId = () => Math.random()
  .toString(36)
  .replace(/[\d\.]/g, '');

const useUniqueAlphabeticalId = (id?: string) => {
  const uniqueAlphabeticalId = useMemo(() => createUniqueAlphabeticalId(), []);

  return id ?? uniqueAlphabeticalId;
};

const OdysseyCacheProvider = ({
  children,
  nonce,
}: {
  children: ReactElement;
  nonce?: string;
}) => {
  const uniqueAlphabeticalId = useUniqueAlphabeticalId();

  const emotionCache = useMemo(
    () => createCache({
      key: uniqueAlphabeticalId,
      nonce: nonce || window.cspNonce,
      stylisPlugins: [
        prefixer as unknown as StylisPlugin,
        logical({ rootDirElement: '#okta-sign-in' }) as unknown as StylisPlugin,
      ],
    }),
    [nonce, uniqueAlphabeticalId],
  );

  return <CacheProvider value={emotionCache}>{children}</CacheProvider>;
};

OdysseyCacheProvider.defaultProps = {
  nonce: undefined,
};

const MemoizedOdysseyCacheProvider = memo(OdysseyCacheProvider);

export { MemoizedOdysseyCacheProvider as CustomPluginsOdysseyCacheProvider };
