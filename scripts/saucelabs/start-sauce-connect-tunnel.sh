: "${SAUCE_USERNAME?:"missing SAUCE_USERNAME"}"
: "${SAUCE_ACCESS_KEY?:"missing SAUCE_ACCESS_KEY"}"

curl -LO https://saucelabs.com/downloads/sc-4.8.2-linux.tar.gz
tar xvf ./sc-4.8.2-linux.tar.gz
./sc-4.8.2-linux/bin/sc -u $SAUCE_USERNAME -k $SAUCE_ACCESS_KEY --region us-west --tunnel-name SIW_testcafe_saucelabs_tunnel --readyfile .ready.json
