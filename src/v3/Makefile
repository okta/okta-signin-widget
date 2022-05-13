#!/usr/bin/make -f

SRC_FOLDER=./src
DIST_FOLDER=../../dist/dist/
WIDGET_VERSION=0.0.0-local # for local development on rain
WIDGET_CDN=${TOMCAT_HOME}/webapps/ROOT/js/sdk/okta-signin-widget/${WIDGET_VERSION}
WIDGET_CDN_INTELLIJ=${OKTA_HOME}/okta-core/webapp/target/okta-core.webapp-1.0.0-SNAPSHOT/js/sdk/okta-signin-widget/${WIDGET_VERSION}

build:
	yarn build

copy-to-tomcat:
	mkdir -p ${WIDGET_CDN} && \
	cp -R ${DIST_FOLDER} ${WIDGET_CDN}

copy-to-intellij:
	mkdir -p ${WIDGET_CDN_INTELLIJ} && \
	cp -R ${DIST_FOLDER} ${WIDGET_CDN_INTELLIJ}

rain: build copy-to-tomcat copy-to-intellij
