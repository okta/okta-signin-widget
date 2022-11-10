import { _, $ } from '@okta/courage';
import { ConfigError } from 'util/Errors';
import OAuth2Util from 'util/OAuth2Util';

export default function buildRenderOptions(widgetOptions = {}, options = {}) {
  const authParams = $.extend(true, {}, widgetOptions.authParams, _.pick(options, OAuth2Util.AUTH_PARAMS));
  const { el, clientId, redirectUri } = Object.assign({}, widgetOptions, options);
  const renderOptions = Object.assign({}, { el, clientId, redirectUri, authParams });

  if (!renderOptions.el) {
    throw new ConfigError('"el" is required');
  }

  if (!renderOptions.clientId) {
    throw new ConfigError('"clientId" is required');
  }

  if (!renderOptions.redirectUri) {
    throw new ConfigError('"redirectUri" is required');
  }

  return renderOptions;
}