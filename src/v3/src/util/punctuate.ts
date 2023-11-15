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

const endsWithPunctuation = (str: string) => {
  // Terminal punctuation chars are  . ? !
  // Internal punctuation chars are  , ; : ( ) —
  // Need to support Unicode punctuation characters.

  // This regular expression checks that last char is any kind of punctuation
  //  except opening/closing quotes, connector (underscore), opening bracket
  const matchRes = str.trim().match(/(\p{Po}|\p{Pd}|\p{Pe})$/mu);
  // Exclude some punctuation chars that are not used to separate parts of sentence
  return matchRes && !['"', '\''].includes(matchRes[0]);
};

export const punctuate = (str: string) => {
  // If string has no punctuation at the end, add period. Otherwise return string as-is.
  // This util is useful to add `aria-label` for element with a text content
  //  that is not a valid sentence.
  // When ids of such elements are used in `aria-describedby`, punctuation
  //  is necessary to separate texts.
  if (!endsWithPunctuation(str)) {
    return `${str.trim()}.`;
  }
  return str;
};
