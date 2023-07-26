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

import { Link } from '@mui/material';
import * as Tokens from '@okta/odyssey-design-tokens';
import { Box, Typography } from '@okta/odyssey-react-mui';
import { escape } from 'lodash';
import { Fragment, FunctionComponent, h } from 'preact';

import { CONSENT_HEADER_STEPS, IDX_STEP } from '../../constants';
import { useWidgetContext } from '../../contexts';
import { useHtmlContentParser } from '../../hooks';
import { getAppInfo, getHeadingReplacerFn, loc } from '../../util';

const ConsentHeader: FunctionComponent = () => {
  const { idxTransaction } = useWidgetContext();
  const { clientUri, label, logo } = idxTransaction
    ? getAppInfo(idxTransaction)
    : { clientUri: undefined, label: undefined, logo: undefined };
  const appName = escape(label);
  const granularConsentTitle = loc(
    'oie.consent.scopes.granular.title',
    'login',
    [appName],
    {
      $1: { element: 'h2', attributes: { class: 'no-translate' } },
      $2: { element: 'p' },
    },
  );
  const parsedGranularConsentTitle = useHtmlContentParser(
    granularConsentTitle,
    { replace: getHeadingReplacerFn({}, 'h2', 2, 3) },
  );

  if (!idxTransaction?.nextStep || !CONSENT_HEADER_STEPS.includes(idxTransaction.nextStep.name)) {
    return null;
  }
  const stepName = idxTransaction.nextStep.name;

  const getAppLogo = (altText: string, logoHref?: string) => (
    typeof logoHref !== 'undefined' && (
      <Box
        component="img"
        src={logoHref}
        width="32px"
        height="32px"
        alt={altText}
        className="client-logo custom-logo"
        aria-hidden="true"
      />
    )
  );

  const getAppIcon = () => {
    const clientUriObj = (clientUri as Record<string, string | undefined> | undefined);
    const logoObj = (logo as Record<string, string | undefined> | undefined);
    const href: string | undefined = clientUriObj?.href;
    const logoHref: string | undefined = logoObj?.href;
    const altText = loc('logo.for.the.app.alt.text', 'login');
    return (
      <Box
        display="flex"
        justifyContent="center"
      >
        {typeof href !== 'undefined' && typeof logoHref !== 'undefined'
          ? (
            <Box component="div">
              <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={altText}
              >
                {getAppLogo(altText, logoHref)}
              </Link>
            </Box>
          )
          : getAppLogo(altText, logoHref)}
      </Box>
    );
  };

  const getHeaderContent = () => {
    if ([IDX_STEP.CONSENT_ADMIN, IDX_STEP.CONSENT_ENDUSER].includes(stepName)) {
      // @ts-expect-error OKTA-598777 authentication missing from IdxContext interface
      const { rawIdxState: { authentication: { value: { issuer } } = {} } } = idxTransaction;
      const hasIssuer = stepName === IDX_STEP.CONSENT_ADMIN && typeof issuer?.uri !== 'undefined';
      const titleText = stepName === IDX_STEP.CONSENT_ADMIN
        ? loc('oie.consent.scopes.admin.title', 'login')
        : loc('oie.consent.scopes.enduser.title', 'login');
      return (
        <Fragment>
          <Box
            component="span"
            className="title-text"
            textAlign="center"
          >
            <Typography
              component="h1"
              variant="h3"
              className="no-translate"
            >
              {appName}
              {' '}
            </Typography>
            <Typography paragraph>{titleText}</Typography>
            {hasIssuer && (
              <Box
                display="flex"
                justifyContent="center"
              >
                <Typography
                  sx={(theme) => ({
                    marginBlockEnd: theme.spacing(4),
                    backgroundColor: Tokens.ColorBackgroundPrimaryLight,
                    color: Tokens.ColorBackgroundPrimaryDark,
                    padding: '4px 2px',
                  })}
                  className="issuer no-translate"
                >
                  {issuer.uri}
                </Typography>
              </Box>
            )}
          </Box>
        </Fragment>
      );
    }

    return (
      <Box
        component="div"
        className="title-text"
        textAlign="center"
      >
        {parsedGranularConsentTitle}
      </Box>
    );
  };

  return (
    <Box>
      {getAppIcon()}
      {getHeaderContent()}
    </Box>
  );
};

export default ConsentHeader;
