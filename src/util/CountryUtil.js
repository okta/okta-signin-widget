/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { loc } from './loc';
import bundles from './Bundles';
import countryCallingCodes from './countryCallingCodes';
import { compare } from './utils';
const fn = {};

// () => [{ countryCode: countryName }], sorted by countryName
fn.getCountries = function() {
  return Object.entries(bundles.country)
    // HM, BV, and TF do not have phone prefixes, so don't give the
    // user the option to choose these countries. FYI it appears that these
    // countries do not have calling codes because they are ~~uninhabited~~
    .filter(([code]) => {
      return !['HM', 'BV', 'TF'].includes(code);
    })
    // Sort it; figure out if there is a better way to do this (best would
    // be to sort it in the properties file!!)
    // eslint-disable-next-line no-unused-vars
    .sort(([_code1, name1], [_code2, name2]) => compare(name1, name2))
    .reduce((sorted, [code, name]) => {
      return {
        ...sorted,
        [code]: name
      };
    }, {});
};

fn.getCountryCode = function() {
  return Object.entries(bundles.country)
    // HM, BV, and TF do not have phone prefixes, so don't give the
    // user the option to choose these countries. FYI it appears that these
    // countries do not have calling codes because they are ~~uninhabited~~
    .filter(([code]) => {
      return !['HM', 'BV', 'TF'].includes(code);
    })
    // eslint-disable-next-line no-unused-vars
    .sort(([_code1, name1], [_code2, name2]) => compare(name1, name2))
    .reduce((sorted, [code, name]) => {
      return {
        ...sorted,
        [code]: loc('country.option.label', 'login', [name, code])
      };
    }, {});
};

fn.getCallingCodeForCountry = function(countryCode) {
  return countryCallingCodes[countryCode];
};

export default fn;
