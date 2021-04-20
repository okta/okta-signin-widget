
export async function assertNoEnglishLeaks(mockFile, viewText, noTranslationContent) {
  const regEx = '(?<=\》).+?(?=\《)'; // eslint-disable-line no-useless-escape
  const pseudoLocSymbols = ['》', '《', '《 》', '《》'];
  if (!viewText.length) {
    return;
  }
  // Exclude all elements with a class of no-translate. Example phone numbers
  if (noTranslationContent.length) {
    viewText = viewText.replace(noTranslationContent, '');
  }
  let extractedString = viewText.trim().replace(new RegExp(regEx, 'g'), ' ');
  extractedString = extractedString.split(' ');
  const enLeaks = extractedString.filter( item => {
    return item.length && !pseudoLocSymbols.includes(item.trim());
  });
  if (enLeaks.length) {
    const error = enLeaks.join(' ');
    throw new Error(`Unlocalized text found in mock ${mockFile}: ${error}`);
  }
}
