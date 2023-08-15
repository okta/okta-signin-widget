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

import { useEffect } from 'preact/hooks';

import { useWidgetContext } from '../contexts';
import { getPageTitle } from '../util';

export const useDocumentTitle = (title: string): null => {
  const { widgetProps, idxTransaction } = useWidgetContext();
  const pageTitle = getPageTitle(widgetProps, title, idxTransaction);

  useEffect(() => {
    if (typeof pageTitle !== 'undefined') {
      document.title = pageTitle;
    }
  }, [pageTitle]);

  return null;
};
