#!/usr/bin/make -f

SRC_FOLDER=./src
DIST_FOLDER=./build/dist
WIDGET_VERSION=0.0.0-local # for local development on rain
WIDGET_CDN=${TOMCAT_HOME}/webapps/ROOT/js/sdk/okta-signin-widget/${WIDGET_VERSION}

clean:
	rm -rf ${DIST_FOLDER}

build: clean
	yarn build

rain: build
	rm -rf ${WIDGET_CDN} && \
	cp -R ${DIST_FOLDER} ${WIDGET_CDN}
