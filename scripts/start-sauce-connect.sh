#!/bin/bash
set -e

# Setup and start Sauce Connect for your TravisCI build
SAUCE_CONNECT_VERSION=4.6.2
SAUCE_CONNECT_URL="https://saucelabs.com/downloads/sc-${SAUCE_CONNECT_VERSION}-linux.tar.gz"
SAUCE_CONNECT_DIR="/tmp/sauce-connect-${RANDOM}"
SAUCE_CONNECT_DOWNLOAD="sc-latest-linux.tar.gz"

BROWSER_PROVIDER_READY_FILE="/tmp/sauce-connect-ready"
SAUCE_CONNECT_LOG="/tmp/sauce-connect"
SAUCE_CONNECT_STDOUT="/tmp/sauce-connect.stdout"
SAUCE_CONNECT_STDERR="/tmp/sauce-connect.stderr"

# Get Connect and start it
mkdir -p $SAUCE_CONNECT_DIR
cd $SAUCE_CONNECT_DIR
curl $SAUCE_CONNECT_URL -o $SAUCE_CONNECT_DOWNLOAD
mkdir sauce-connect
tar --extract --file=$SAUCE_CONNECT_DOWNLOAD --strip-components=1 --directory=sauce-connect > /dev/null
rm $SAUCE_CONNECT_DOWNLOAD

ARGS=""

# Set tunnel-id only on Travis, to make local testing easier.
if [ ! -z "$TRAVIS_JOB_NUMBER" ]; then
  ARGS="$ARGS --tunnel-identifier $TRAVIS_JOB_NUMBER"
fi
if [ ! -z "$BROWSER_PROVIDER_READY_FILE" ]; then
  ARGS="$ARGS --readyfile $BROWSER_PROVIDER_READY_FILE"
fi

echo "Starting Sauce Connect in the background, logging into:"
echo "  $SAUCE_CONNECT_LOG"
echo "  $SAUCE_CONNECT_STDOUT"
echo "  $SAUCE_CONNECT_STDERR"
# -B java.com helps to disable Java update popups in IE.
sauce-connect/bin/sc -u $SAUCE_USERNAME -k $SAUCE_ACCESS_KEY $ARGS \
  --logfile $SAUCE_CONNECT_LOG -B java.com &

# Wait for Connect to be ready before exiting
echo "Connecting to Sauce..."
while [ ! -f $BROWSER_PROVIDER_READY_FILE ]; do
  echo "."
  sleep 1
done
echo "Connected!"
