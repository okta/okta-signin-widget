import fs from 'fs-extra';
import path from 'path';

const PATH_TO_LOC_FILES = path.resolve(__dirname, '../../..', 'packages/@okta/i18n/src/json');

const parseLocale = locale => {
  if (/-/.test(locale)) {
    const parts = locale.split('-');
    parts[1] = parts[1].toUpperCase();
    return parts.join('_');
  }

  if (locale === 'pt') {
    return 'pt_BR';
  }

  if (locale === 'nl') {
    return 'nl_NL';
  }

  return locale;
};

const loadLangBundle = async (lang) => {
  const locale = parseLocale(lang);
  const countryFileRaw = await fs.readFile(path.resolve(PATH_TO_LOC_FILES, `country_${locale}.json`));
  const loginFileRaw = await fs.readFile(path.resolve(PATH_TO_LOC_FILES, `login_${locale}.json`));

  return {
    country: JSON.parse(countryFileRaw),
    login: JSON.parse(loginFileRaw)
  }
}

export const locUtil = async (lang) => {
  const bundles = await loadLangBundle(lang);
  return (key, bundle='login', params) => {
    // TODO: handle params
    return bundles[bundle][key];
  }
}