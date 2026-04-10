import { getOAuth2HeadersProvider as Gn } from '../../../node_modules/@okta/ui-libraries-oidc-auth-headers/dist/index.js';
export { AuthorizationHeaderTypes } from '../../../node_modules/@okta/ui-libraries-oidc-auth-headers/dist/index.js';
import { OktaPageData } from '../../../node_modules/@okta/ui-libraries-monolith/dist/esm/OktaPageData.js';
import '../../../node_modules/@okta/ui-libraries-monolith/dist/esm/ServerStatus.js';

var PageDataEnum;

(function (PageDataEnum) {
  PageDataEnum[PageDataEnum["hostAppName"] = 0] = "hostAppName";
  PageDataEnum[PageDataEnum["isOidcEnabled"] = 1] = "isOidcEnabled";
})(PageDataEnum || (PageDataEnum = {}));

/**
 * Namespace for page data used by Courage to retrieve OIDC request headers.
 * This namespace is used to store and retrieve data related to the host application
 * and whether OIDC is enabled.
 * This namespace was chosen because courage is the library itself that provides the method
 * below that is used within the Collection and Model sync methods to retrieve OIDC request headers.
 */
const PAGE_DATA_NAMESPACE = '@okta/courage';
const pageData = new OktaPageData(PAGE_DATA_NAMESPACE, PageDataEnum);
const hostAppName = pageData.get(PageDataEnum.hostAppName);
const isEnabled = pageData.get(PageDataEnum.isOidcEnabled) || false;
let provider; // eslint-disable-next-line import/prefer-default-export

const getOidcRequestHeaders = async (scopes, url, method, authParams) => {
  if (!provider) {
    provider = Gn({
      appName: hostAppName,
      isEnabled: isEnabled
    });
  }

  return provider.getOAuth2Headers(scopes, url, method, authParams);
};

export { getOidcRequestHeaders };
