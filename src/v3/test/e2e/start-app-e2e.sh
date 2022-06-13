#!/bin/bash

# turn off PKCE for testcafe
export PREACT_APP_USE_PKCE=false

# set widget configuration
export PREACT_APP_ISSUER='https://oie-123456.oktapreview.com/oauth2/default'
export PREACT_APP_CLIENT_ID='dummy_client_id'
export PREACT_APP_REDIRECT_URI='http://localhost:8080/login/callback'
export PREACT_APP_BASE_URL='https://oie-123456.oktapreview.com'
export PREACT_APP_STORAGE='localStorage'

# start the application
yarn dev
