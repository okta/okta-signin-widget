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

import { Box } from '@mui/material';
import { Link, Typography, useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { escape } from 'lodash';
import { Fragment, FunctionComponent, h } from 'preact';

import { IDX_STEP } from '../../constants';
import { useWidgetContext } from '../../contexts';
import { useHtmlContentParser } from '../../hooks';
import { getAppInfo, getHeadingReplacerFn, loc } from '../../util';
import Image from '../Image';

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
    { replace: getHeadingReplacerFn({}, 'h2', 2, 6) },
  );
  const tokens = useOdysseyDesignTokens();

  const getAppLogo = (altText: string, logoHref?: string) => (
    typeof logoHref !== 'undefined' && (
      <Image
        src={logoHref}
        width="32px"
        height="32px"
        alt={altText}
        testId="client-logo"
        ariaHidden
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
            <Box>
              <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                ariaLabel={altText}
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
    const stepName = idxTransaction!.nextStep!.name;
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
            data-se="title-text"
            textAlign="center"
          >
            <Typography
              component="h2"
              variant="h6"
              translate="no"
            >
              {appName}
            </Typography>
            <Typography variant="body">{titleText}</Typography>
            {hasIssuer && (
              <Box
                display="flex"
                justifyContent="center"
              >
                <Box
                  sx={{
                    marginBlockEnd: tokens.Spacing5,
                    backgroundColor: tokens.PalettePrimaryLighter,
                    color: tokens.PalettePrimaryDarker,
                    padding: `${tokens.Spacing1} ${tokens.Spacing2}`,
                  }}
                  data-se="issuer"
                  translate="no"
                >
                  {issuer.uri}
                </Box>
              </Box>
            )}
          </Box>
        </Fragment>
      );
    }

    return (
      <Box
        data-se="title-text"
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
