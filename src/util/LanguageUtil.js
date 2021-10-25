import Bundles from 'util/Bundles';

function loadLanguage(appState, settings) {
  const languageCode = appState.get('languageCode');
  const i18n = settings.get('i18n');
  const assetBaseUrl = settings.get('assets.baseUrl');
  const assetRewrite = settings.get('assets.rewrite');
  const supportedLanguages = settings.get('supportedLanguages');

  const timeout = setTimeout(function() {
    // Trigger a spinner if we're waiting on a request for a new language.
    appState.trigger('loading', true);
  }, 200);

  return Bundles.loadLanguage(languageCode, i18n, {
    baseUrl: assetBaseUrl,
    rewrite: assetRewrite,
  }, supportedLanguages).then(function() {
    clearTimeout(timeout);
    appState.trigger('loading', false);
  });
  // TODO: what if load language error?
}

export default {
  loadLanguage,
};
