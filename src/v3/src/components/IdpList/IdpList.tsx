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
import { TextField, useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { h } from 'preact';
import { useState } from 'preact/hooks';

import {
  ButtonElement,
  IdpListElement,
  UISchemaElementComponent,
} from '../../types';
import { loc } from '../../util';
import Button from '../Button';

const IDP_LIST_HEIGHT = '220px'; // fixed height so layout doesn't jump when filtering

const IdpList: UISchemaElementComponent<{
  uischema: IdpListElement;
}> = ({ uischema }) => {
  const { buttons, dataSe } = uischema.options;
  const tokens = useOdysseyDesignTokens();
  const [filterQuery, setFilterQuery] = useState('');

  const filteredButtons = filterQuery.trim()
    ? buttons.filter(
      (btn) => (btn.label ?? '').toLowerCase().includes(filterQuery.toLowerCase()),
    )
    : buttons;

  const statusText = filterQuery.trim()
    ? (filteredButtons.length === 0
      ? loc('idps.search.no.results', 'login')
      : loc('idps.search.results.count', 'login', [String(filteredButtons.length)]))
    : '';

  return (
    <Box role="search" aria-label={loc('idps.search.label', 'login')}>
      <Box sx={{ marginBlockEnd: tokens.Spacing3 }}>
        <TextField
          label={loc('idps.search.label', 'login')}
          placeholder={loc('idps.search.typeahead.placeholder', 'login')}
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.currentTarget.value)}
          isFullWidth
          testId="idp-search-input"
          type="text"
        />
      </Box>
      {/* Announce filter results to screen readers */}
      <Box
        role="status"
        sx={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clipPath: 'inset(50%)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {statusText}
      </Box>
      <Box
        data-se={dataSe}
        sx={{
          height: IDP_LIST_HEIGHT,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
          paddingRight: tokens.Spacing2,
          // Persistent scrollbar — do NOT add scrollbar-width or scrollbar-color,
          // Chrome 121+ ignores ::-webkit-scrollbar when those are present.
          '&::-webkit-scrollbar': {
            WebkitAppearance: 'none',
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: '3px',
          },
        }}
      >
        {filteredButtons.length > 0 ? (
          <Box
            component="ul"
            aria-label={loc('idps.search.label', 'login')}
            sx={{
              listStyle: 'none',
              padding: tokens.Spacing0,
              marginBlockStart: tokens.Spacing0,
            }}
          >
            {filteredButtons.map((button: ButtonElement, index: number) => (
              <Box
                key={button.options.dataSe ?? index}
                component="li"
                sx={{ marginBlockEnd: tokens.Spacing4 }}
              >
                <Button
                  uischema={{
                    ...button,
                    focus: index === 0 && !filterQuery ? uischema.focus : false,
                    ariaDescribedBy: uischema.ariaDescribedBy,
                  }}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Box
            role="status"
            data-se="idp-no-results"
            sx={{
              textAlign: 'center',
              padding: tokens.Spacing4,
            }}
          >
            {loc('idps.search.no.results', 'login')}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default IdpList;
