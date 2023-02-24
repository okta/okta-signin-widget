/*
 * Copyright (c) 2022-present, Okta, Inc. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant
 * to the Apache License, Version 2.0 (the "License.")
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { config } from '../widgetrc';
import { OktaSignIn } from './OktaSignIn';

// if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
//   import('./mocks/browser')
//     .then(({ getWorker }) => getWorker())
//     .then((worker) => worker?.start());
// }

if (import.meta.env.MODE === 'development') {
  // if (import.meta.env.VITE_MSW) {
  //   const { worker } = await import('../mocks/browser');
  //   worker.start({ quiet: import.meta.env.VITE_MSW_QUIET });
  // }
  
  // eslint-disable-next-line no-new
  new OktaSignIn(config);
}
