module.exports = {
  'plugins': [
    'stylelint-scss',
    './stylelint-local-rules.js'
  ],
  'rules': {
    'okta/no-absolute-urls': true,
    'declaration-no-important': true,
    'media-feature-name-no-vendor-prefix': null,
    'no-duplicate-selectors': null,
    'rule-empty-line-before': null,
    'selector-max-id': 0,
    'at-rule-no-vendor-prefix': null,
    'block-no-empty': true,
    'block-opening-brace-space-before': 'always',
    'color-hex-case': 'lower',
    'color-hex-length': 'short',
    'color-named': 'never',
    'color-no-invalid-hex': true,
    'comment-whitespace-inside': 'always',
    'declaration-bang-space-after': 'never',
    'declaration-bang-space-before': 'always',
    'declaration-block-no-duplicate-properties': [
      true,
      {
        'ignore': [
          'consecutive-duplicates-with-different-values'
        ]
      }
    ],
    'declaration-block-semicolon-newline-after': 'always-multi-line',
    'declaration-block-trailing-semicolon': 'always',
    'declaration-colon-space-after': 'always',
    'declaration-colon-space-before': 'never',
    'function-comma-space-after': 'always-single-line',
    'function-parentheses-space-inside': 'never',
    'function-url-quotes': 'always',
    'length-zero-no-unit': true,
    'max-nesting-depth': 5,
    'no-eol-whitespace': true,
    'no-missing-end-of-source-newline': true,
    'number-leading-zero': 'always',
    'number-no-trailing-zeros': true,
    'property-no-unknown': null,
    'property-no-vendor-prefix': null,
    'scss/at-import-no-partial-leading-underscore': true,
    /* eslint-disable-next-line @okta/okta/no-exclusive-language */
    'scss/at-import-partial-extension-blacklist': [
      'scss'
    ],
    'scss/selector-no-redundant-nesting-selector': true,
    'selector-class-pattern': '[-a-z0-9]',
    'selector-id-pattern': '[-a-z0-9]',
    'selector-list-comma-newline-after': 'always',
    'selector-no-qualifying-type': [
      true,
      {
        'ignore': [
          'attribute',
          'class',
          'id'
        ]
      }
    ],
    'selector-no-vendor-prefix': null,
    'shorthand-property-no-redundant-values': true,
    /* eslint-disable-next-line @okta/okta/no-exclusive-language */
    'unit-allowed-list': [
      'ch',
      'em',
      'ex',
      'rem',
      'cm',
      'in',
      'mm',
      'pc',
      'pt',
      'px',
      'q',
      'vh',
      'vw',
      'vmin',
      'vmax',
      'deg',
      'grad',
      'rad',
      'turn',
      'ms',
      's',
      'Hz',
      'kHz',
      'dpi',
      'dpcm',
      'dppx',
      '%'
    ],
    'value-no-vendor-prefix': null,
    'indentation': 2
  }
};
