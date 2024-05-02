const { resolve } = require('path');
const fs = require('fs');
const properties = require('properties');

const { CI, I18N_REPO_PATH, WRITE_FIXED_I18N, USE_I18N_REPO_ONLY } = process.env;
const ROOT_DIR = resolve(__dirname, '../../../');
const OKTA_I18N_PROPERTIES = `${ROOT_DIR}/packages/@okta/i18n/src/properties`;
const I18N_REPO = I18N_REPO_PATH ? I18N_REPO_PATH : resolve(ROOT_DIR, '../i18n');
const CORE_REPO = resolve(`${process.env.HOME}/okta/okta-core`);


const parseProperties = async ({ lang, resourcePath, bundle }) => {
  const langPostfix = lang === '' ? '' : '_'+lang;
  const propertiesPath = `${resourcePath}/${bundle}${langPostfix}.properties`;
  const propertiesExists = fs.existsSync(propertiesPath);
  if (!propertiesExists) {
    return null;
  }
  return new Promise((resolve, reject) => {
    properties.parse(propertiesPath, {
      path: true,
    }, (error, res) => {
      if (error) {
        reject(`Unable to parse properties file ${propertiesPath}`);
      } else {
        resolve(res);
      }
    });
  });
};

const updateProperties = ({ lang, resourcePath, bundle, updates }) => {
  const langPostfix = lang === '' ? '' : '_'+lang;
  const propertiesPath = `${resourcePath}/${bundle}${langPostfix}.properties`;
  const propertiesData = fs.readFileSync(propertiesPath, 'utf8');
  const propertiesLines = propertiesData.split('\n');
  for (let i = 0 ; i < propertiesLines.length ; i++) {
    const line = propertiesLines[i];
    const lineTrimmed = line.trim();
    const isDataLine = lineTrimmed.length && !lineTrimmed.startsWith('#');
    if (isDataLine) {
      const k = lineTrimmed.substring(0, lineTrimmed.indexOf('=')).trim();
      const v = updates[k]?.to;
      if (k && v) {
        const newLine = properties.stringify({ [k]: v }, {
          unicode: true
        });
        propertiesLines[i] = newLine;
      }
    }
  }
  const newPropertiesData = propertiesLines.join('\n');
  fs.writeFileSync(propertiesPath, newPropertiesData);
};

const getCoreResourcesPath = () => {
  // Get `messages-translated` resources from `i18n` or `okta-core` repo
  if (fs.existsSync(I18N_REPO) && fs.existsSync(`${I18N_REPO}/packages/messages-translated`)) {
    return `${I18N_REPO}/packages/messages-translated`;
  }
  if (fs.existsSync(CORE_REPO) && fs.existsSync(`${CORE_REPO}/resources/src/main/resources`)) {
    return `${CORE_REPO}/resources/src/main/resources`;
  }
  throw new Error(`No i18n repo found at ${I18N_REPO}`);
};

const getSiwResourcesPath = () => {
  if (USE_I18N_REPO_ONLY === 'true') {
    return `${I18N_REPO}/packages/login`;
  }
  return OKTA_I18N_PROPERTIES;
};

const getLanguges = ({ resourcePath, bundle }) => {
  const fileNames = fs.readdirSync(resourcePath).filter(fileName =>
    fileName.startsWith(bundle) && fileName.endsWith('.properties')
  );
  const langs = fileNames.map(fileName => {
    const langPostfix = fileName.split('.')[0].substring(bundle.length);
    return langPostfix.startsWith('_') ? langPostfix.substring(1) : langPostfix;
  });
  const skipLangs = [ 'ok_PL', 'ok_SK', 'in' ];
  return langs.filter(lang => !skipLangs.includes(lang));
};

const getCorelang = (siwLang, coreLangs) => coreLangs.find(coreLang => (
  coreLang === siwLang
  || coreLang === siwLang.replace('_', '-')
  || coreLang.split('-')[0] === siwLang
));

const buildCompexityKeysMapping = (siwTranslations, coreTranslations) => {
  const siwPrefix = 'password.complexity.';
  const corePrefixes = [
    siwPrefix,
    'password_policy.',
    'password_policy.new.text.',
    'password_policy.complexity.',
    'password_policy.description.',
  ];
  const mappingOverride = {
    'password.complexity.history': 'password_policy.new.text.history',
  };

  const siwKeys = Object.keys(siwTranslations).filter(k =>
    k.startsWith(siwPrefix)
    && !k.endsWith('.description') && !k.endsWith('.header')
  );
  const coreKeys = Object.keys(coreTranslations).filter(k =>
    corePrefixes.find(prefix => k.startsWith(prefix))
    && !k.endsWith('.html')
  );

  const mapping = {};
  for (const siwKey of siwKeys) {
    const baseKey = siwKey.substring(siwPrefix.length);
    const coreKey = coreKeys.find(coreKey => (
      corePrefixes.find(prefix => coreKey === (prefix + baseKey))
    ));
    mapping[siwKey] = mappingOverride[siwKey] || coreKey;
  }

  const unmappedKeys = siwKeys.filter(k => !mapping[k]);
  if (unmappedKeys.length) {
    console.warn(`No mapping found for keys: ${unmappedKeys.join(', ')}`);
  }

  return mapping;
};

const verifyTranslations = async ({ canUpdate }) => {
  let res = 0;
  const coreResourcesPath = getCoreResourcesPath();
  const siwResourcesPath = getSiwResourcesPath();
  console.log(`Using core resource path: ${coreResourcesPath}`);
  console.log(`Using widget resource path: ${siwResourcesPath}`);
  const siwLangs = getLanguges({
    resourcePath: siwResourcesPath,
    bundle: 'login',
  });
  const coreLangs = getLanguges({
    resourcePath: coreResourcesPath,
    bundle: 'messages-translated',
  });
  for (let siwLang of siwLangs) {
    const siwProperties = await parseProperties({
      resourcePath: siwResourcesPath,
      bundle: 'login',
      lang: siwLang,
    });
    if (!siwProperties) {
      console.error(`Missing SIW properties file for lang ${siwLang || 'default'}`);
      res = 2;
    }

    const coreLang = getCorelang(siwLang, coreLangs);
    const coreProperties = await parseProperties({
      resourcePath: coreResourcesPath,
      bundle: 'messages-translated',
      lang: coreLang,
    });
    if (!coreProperties) {
      console.error(`Missing core properties file for lang ${siwLang || 'default'}`);
      res = 2;
    }

    if (siwProperties && coreProperties) {
      const mapping = buildCompexityKeysMapping(siwProperties, coreProperties);
      const updates = {};
      for (let k in mapping) {
        const siwTranslation = siwProperties[k];
        const coreTranslation = coreProperties[mapping[k]];
        if (siwTranslation && coreTranslation && siwTranslation !== coreTranslation) {
          updates[k] = {
            from: siwTranslation,
            to: coreTranslation,
          };
        }
      }
      if (Object.keys(updates).length) {
        console.log(`Need to update ${Object.keys(updates).length} translations for lang ${siwLang || 'default'}`);
        console.log(updates);
        if (canUpdate) {
          updateProperties({
            resourcePath: siwResourcesPath,
            bundle: 'login',
            lang: siwLang,
            updates,
          });
        } else {
          res = 1;
        }
      }
    }
  }

  if (res === 1 && !canUpdate) {
    console.log("Please run `yarn verify-translations --write` and commit changes.");
  }

  return res;
};

const start = async () => {
  const res = await verifyTranslations({
    canUpdate: !CI && WRITE_FIXED_I18N === 'true' && USE_I18N_REPO_ONLY !== 'true'
  });
  process.exit(res);
};

start();
