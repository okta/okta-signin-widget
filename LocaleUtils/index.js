
export async function assertNoEnglishLeaks(mockFile, viewText, noTranslationContent) {
  const regEx = '(?<=\》).+?(?=\《)'; // eslint-disable-line no-useless-escape
  const pseudoLocSymbols = ['》', '《', '《 》', '《》'];
  if (!viewText.length) {
    return;
  }
  // Exclude all elements with a class of no-translate. Example phone numbers
  if (noTranslationContent.length) {
    viewText = viewText.split(noTranslationContent).join('');
  }
  let extractedString = viewText.trim().replace(new RegExp(regEx, 'g'), ' ');
  /*
    Handle period at the end of string for these mocks. TODO Fix this in pseudo-loc package
    'oda-enrollment-ios','oda-enrollment-android',
    'authenticator-verification-phone-voice-no-profile','authenticator-verification-phone-sms-no-profile'
  */
  extractedString = extractedString.replace('《·', ' ');
  extractedString = extractedString.replace('《.', '《');
  extractedString = extractedString.split(' ');
  const enLeaks = extractedString.filter( item => {
    return item.trim() && item.length && !pseudoLocSymbols.includes(item.trim());
  });
  if (enLeaks.length) {
    const error = enLeaks.join(' ');
    throw new Error(`Unlocalized text found in mock ${mockFile}: ${error}`);
  }
}
