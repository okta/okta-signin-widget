import appleIconSvg from '../img/socialButtonIcons/apple.svg';
import facebookIconSvg from '../img/socialButtonIcons/facebook.svg';
import googleIconSvg from '../img/socialButtonIcons/google.svg';
import linkedinIconSvg from '../img/socialButtonIcons/linkedin.svg';
import msIconSvg from '../img/socialButtonIcons/ms.svg';
import oktaIconSvg from '../img/socialButtonIcons/okta.svg';
import discordIconSvg from '../img/socialButtonIcons/discord.svg';
import adobeIconSvg from '../img/socialButtonIcons/adobe.svg';
import amazonIconSvg from '../img/socialButtonIcons/amazon.svg';
import githubIconSvg from '../img/socialButtonIcons/github.svg';
import gitlabIconSvg from '../img/socialButtonIcons/gitlab.svg';
import lineIconSvg from '../img/socialButtonIcons/line.svg';
import orcidIconSvg from '../img/socialButtonIcons/orcid.svg';
import paypalIconSvg from '../img/socialButtonIcons/paypal.svg';
import quickbooksIconSvg from '../img/socialButtonIcons/quickbooks.svg';
import salesforceIconSvg from '../img/socialButtonIcons/salesforce.svg';
import spotifyIconSvg from '../img/socialButtonIcons/spotify.svg';
import xeroIconSvg from '../img/socialButtonIcons/xero.svg';
import yahooIconSvg from '../img/socialButtonIcons/yahoo.svg';
import yahooJapanIconSvg from '../img/socialButtonIcons/yahoo-japan.svg';

export const getSocialIdpButtonIcon = (idpType: string) : string => {
    const idpIconMapping: Record<string, string> = {
        apple: appleIconSvg,
        facebook: facebookIconSvg,
        google: googleIconSvg,
        linkedin: linkedinIconSvg,
        microsoft: msIconSvg,
        okta: oktaIconSvg,
        github: githubIconSvg,
        gitlab: gitlabIconSvg,
        yahoo: yahooIconSvg,
        line: lineIconSvg,
        paypal: paypalIconSvg,
        paypal_sandbox: paypalIconSvg,
        salesforce: salesforceIconSvg,
        amazon: amazonIconSvg,
        yahoojp: yahooJapanIconSvg,
        discord: discordIconSvg,
        adobe: adobeIconSvg,
        orcid: orcidIconSvg,
        spotify: spotifyIconSvg,
        xero: xeroIconSvg,
        quickbooks: quickbooksIconSvg,
    };
    return idpIconMapping[idpType];
  };