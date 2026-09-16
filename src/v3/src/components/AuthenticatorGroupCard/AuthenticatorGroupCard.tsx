/*
 * Copyright (c) 2026-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { Box, Typography } from '@mui/material';
import { useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { ClockIcon } from '@okta/odyssey-react-mui/icons';
import { h } from 'preact';

import {
  AuthenticatorButtonElement,
  AuthenticatorButtonListElement,
  AuthenticatorGroupCardElement,
  UISchemaElementComponent,
} from '../../types';
import { loc } from '../../util';
import AuthenticatorButtonList from '../AuthenticatorButton';

/**
 * N-of-M authenticator group card. Renders a bordered container that wraps a
 * group's unenrolled members with:
 *   - an optional group-level grace-period block at the top of the card
 *   - a "Choose {remaining} of:" label chip
 *   - the member buttons themselves, rendered by the existing
 *     AuthenticatorButtonList so per-button DOM (test IDs, data-se, etc.) is
 *     unchanged from a bare-button rendering.
 *
 * The card wrapper carries `data-se="authenticator-enroll-group-{index}"` —
 * a positional index that never leaks the opaque groupId (per contract).
 */
const AuthenticatorGroupCard: UISchemaElementComponent<{
  uischema: AuthenticatorGroupCardElement;
}> = ({ uischema }) => {
  const {
    groupIndex,
    remaining,
    buttons,
    gracePeriodExpiry,
    gracePeriodRequiredDescription,
    gracePeriodRemainingSkipsDescription,
  } = uischema.options;
  const tokens = useOdysseyDesignTokens();

  const hasGracePeriodBlock = !!(
    gracePeriodRequiredDescription
    || gracePeriodRemainingSkipsDescription
  );

  // Per-card unique id so aria-labelledby can pair the card's role=group with
  // its "Choose N of" chip. An authenticator (e.g. Okta Verify) may appear in
  // multiple cards; the region name is what disambiguates them for AT users.
  const labelId = `authenticator-enroll-group-${groupIndex}-label`;

  // Reuse the inner list renderer so member buttons render identically to a
  // bare-button page — same DOM, same test IDs, same interactions.
  const memberList: AuthenticatorButtonListElement = {
    type: 'AuthenticatorButtonList',
    options: {
      buttons: buttons as AuthenticatorButtonElement[],
      dataSe: `authenticator-enroll-group-${groupIndex}-members`,
    },
  };

  return (
    <Box
      data-se={`authenticator-enroll-group-${groupIndex}`}
      role="group"
      aria-labelledby={labelId}
      sx={{
        border: `1px solid ${tokens.BorderColorDisplay}`,
        borderRadius: tokens.BorderRadiusMain,
        backgroundColor: tokens.HueNeutral50,
        padding: tokens.Spacing4,
        paddingBlockEnd: tokens.Spacing3,
        marginBlockEnd: tokens.Spacing4,
        '& ul': { marginBlockEnd: tokens.Spacing0 },
        '& li:last-child': { marginBlockEnd: tokens.Spacing0 },
      }}
    >
      {hasGracePeriodBlock && (
        <Box
          sx={{
            display: 'flex',
            marginBlockEnd: tokens.Spacing3,
          }}
        >
          <ClockIcon sx={{ color: tokens.TypographyColorWarning }} />
          {gracePeriodRequiredDescription ? (
            <Box sx={{ marginLeft: tokens.Spacing1 }}>
              <Typography
                paragraph
                data-se="authenticator-grace-period-required-description"
                sx={{
                  fontSize: tokens.TypographySizeSubordinate,
                  fontWeight: tokens.TypographyWeightBodyBold,
                  color: tokens.TypographyColorWarning,
                  margin: tokens.Spacing0,
                  textAlign: 'start',
                }}
              >
                {gracePeriodRequiredDescription}
              </Typography>
              {gracePeriodExpiry && (
                <Typography
                  paragraph
                  data-se="authenticator-grace-period-expiry-date"
                  translate="no"
                  sx={{
                    fontSize: tokens.TypographySizeSubordinate,
                    fontWeight: tokens.TypographyWeightBody,
                    color: tokens.TypographyColorSubordinate,
                    margin: tokens.Spacing0,
                    textAlign: 'start',
                  }}
                >
                  {gracePeriodExpiry}
                </Typography>
              )}
            </Box>
          ) : (gracePeriodRemainingSkipsDescription && (
            <Box sx={{ marginLeft: tokens.Spacing1 }}>
              <Typography
                paragraph
                data-se="authenticator-grace-period-skip-count-description"
                sx={{
                  fontSize: tokens.TypographySizeSubordinate,
                  fontWeight: tokens.TypographyWeightBodyBold,
                  color: tokens.TypographyColorWarning,
                  margin: tokens.Spacing0,
                  textAlign: 'start',
                }}
              >
                {gracePeriodRemainingSkipsDescription}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
      <Typography
        component="span"
        id={labelId}
        data-se="authenticator-enroll-group-card-label"
        sx={{
          display: 'inline-block',
          fontSize: tokens.TypographySizeSubordinate,
          fontWeight: tokens.TypographyWeightBodyBold,
          padding: `${tokens.Spacing1} ${tokens.Spacing3}`,
          borderRadius: tokens.BorderRadiusOuter,
          background: tokens.HueNeutral100,
          marginBlockEnd: tokens.Spacing3,
        }}
      >
        {loc('oie.enrollment.group.choose.n.of', 'login', [remaining])}
      </Typography>
      <AuthenticatorButtonList uischema={memberList} />
    </Box>
  );
};

export default AuthenticatorGroupCard;
