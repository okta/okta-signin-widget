import { FORMS, ID_PROOFING_TYPE } from 'v2/ion/RemediationConstants';

export function getIdvName(remediations) {
  let redirectIDVerifyRemediation = remediations.find(remediation => {
    return remediation.name === FORMS.REDIRECT_IDVERIFY;
  });
  return redirectIDVerifyRemediation.idp.name;
}

export function getMetaInfoLinksForCustomIDV(remediations) {
  const redirectIDVerifyRemediation = remediations.find(
    r => r.name === FORMS.REDIRECT_IDVERIFY
  );
  return (
    ((redirectIDVerifyRemediation?.idp?.id === ID_PROOFING_TYPE.IDV_STANDARD ||
      redirectIDVerifyRemediation?.idp?.id === ID_PROOFING_TYPE.IDV_OIN) &&
      redirectIDVerifyRemediation?.idvMetadata) ||
    undefined
  );
}

export function getHelpLinks(remediations) {
  const idpName = getIdvName(remediations);
  let termsOfUse, privacyPolicy;
  switch (idpName?.toUpperCase()) {
  case 'PERSONA':
    termsOfUse = 'https://withpersona.com/legal/terms-of-use';
    privacyPolicy = 'https://withpersona.com/legal/privacy-policy';
    break;
  case 'CLEAR':
    termsOfUse = 'https://www.clearme.com/member-terms';
    privacyPolicy = 'https://www.clearme.com/privacy-policy';
    break;
  case 'INCODE':
    termsOfUse = 'https://incode.id/terms';
    privacyPolicy = 'https://incode.id/privacy';
    break;
  default: {
    const metaInfoLinks = getMetaInfoLinksForCustomIDV(remediations);
    termsOfUse = metaInfoLinks?.termsOfUse;
    privacyPolicy = metaInfoLinks?.privacyPolicy;
    break;
  }
  }
  return {
    termsOfUse,
    privacyPolicy
  };
}
