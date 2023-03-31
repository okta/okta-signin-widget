#!/bin/bash -xe

# MacOS has a slightly different implementation of sed
SED_OPTIONS=("-i")
if [[ "$OSTYPE" == "darwin"* ]]; then
  SED_OPTIONS=("-i" "") # we need to pass an empty parameter after -i
fi

# HBS
find ./node_modules/@okta/courage/src -type f | xargs sed "${SED_OPTIONS[@]}" -e "s/import hbs from 'handlebars-inline-precompile'/import hbs from '@okta\\/handlebars-inline-precompile'/g"

# HBS2
find ./node_modules/@okta/babel-plugin-handlebars-inline-precompile -type f | xargs sed "${SED_OPTIONS[@]}" -e "s/'handlebars-inline-precompile'/'@okta\\/handlebars-inline-precompile'/g"

# QTIP
find ./node_modules/@okta/courage/src -type f | xargs sed "${SED_OPTIONS[@]}" -e "s/import 'qtip'/import '@okta\\/qtip'/g"

# I18N
find ./node_modules/@okta/courage/src -type f | xargs sed "${SED_OPTIONS[@]}" -e "s/from 'okta-i18n-bundles'/from '@okta\\/okta-i18n-bundles'/g"
