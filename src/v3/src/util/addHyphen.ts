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
import { KeyboardEvent } from "src/types"

export const addHyphen = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const currentVal = e.currentTarget.value;
    // Add hyphen after 4th character. includes() check allows deletion of hyphen and prevents double hyphens
    if (currentVal && currentVal.length === 4 && !['Backspace', 'Delete', '-'].includes(e.key)) {
      e.currentTarget.value = currentVal.concat('-');
    } else if (currentVal && currentVal.length > 4 && currentVal.charAt(4) !== '-') {
      // If user types too fast, the above concatenation can be skipped. This retroactively adds a hyphen if it wasn't added
      e.currentTarget.value = currentVal.slice(0, 4) + '-' + currentVal.slice(4);
    }
}
