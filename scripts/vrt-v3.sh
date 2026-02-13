#!/bin/bash

source $OKTA_HOME/$REPO/scripts/setup.sh

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/src/v3/build2/reports/vrt"
echo $TEST_SUITE_TYPE > $TEST_SUITE_TYPE_FILE
echo $TEST_RESULT_FILE_DIR > $TEST_RESULT_FILE_DIR_FILE

# Install Inter font for consistent VRT rendering
# The AL2023 container may have different default fonts than previous containers
echo "Installing Inter font for VRT..."
if command -v dnf &> /dev/null; then
  sudo dnf install -y google-noto-sans-fonts || echo "Warning: Font installation failed"
fi

export VRT_CI=true
setup_service google-chrome-stable 121.0.6167.85-1

echo 'Starting vrt test suite'
if ! yarn workspace v3 test:vrt --no-color; then
	echo "vrt tests failed! Exiting..."
	exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi

exit ${PUBLISH_TYPE_AND_RESULT_DIR};
