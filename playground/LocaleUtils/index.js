
export async function assertNoEnglishLeaks(mockFile, viewText, noTranslationContents) {
  const regEx = '(?<=\》).+?(?=\《)'; // eslint-disable-line no-useless-escape
  const pseudoLocSymbols = ['》', '《', '《 》', '《》'];
  if (!viewText.length) {
    return;
  }
  // Exclude all elements with a class of no-translate. Example phone numbers, urls, vendor names
  if (noTranslationContents.length) {
    //replace each item in noTranslationContents
    noTranslationContents.forEach(noTranslationContent => {
      viewText = viewText.split(noTranslationContent).join('');
    });
  }
  let extractedString = viewText.trim().replace(new RegExp(regEx, 'g'), ' ');
  /*
    Handle period at the end of string for these mocks. TODO Fix this in pseudo-loc package
    'oda-enrollment-ios','oda-enrollment-android',
    'authenticator-verification-phone-voice-no-profile','authenticator-verification-phone-sms-no-profile'
  */
  extractedString = extractedString.replace('《·', ' ');
  extractedString = extractedString.replace('《.', '《');
  /*
    Handle untranslated colon at the end of Odyssey screenreader text for field-level errors (reads as 'Error:')
    TODO: Ask Odyssey why colon is not part of translation bundle
  */
  extractedString = extractedString.replace(/《:/g, '《');
  extractedString = extractedString.split(' ');
  const enLeaks = extractedString.filter( item => {
    return item.trim() && item.length && !pseudoLocSymbols.includes(item.trim());
  });
  if (enLeaks.length) {
    const error = enLeaks.join(' ');
    throw new Error(`Unlocalized text found in mock ${mockFile}: ${error}`);
  }
}
