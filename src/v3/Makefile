#!/usr/bin/make -f

SRC_FOLDER=./src
BUNDLE=../../dist/dist/js/okta-sign-in.next.js
WIDGET_VERSION=next # 0.0.0-local # for local development on rain
WIDGET_CDN=${TOMCAT_HOME}/webapps/ROOT/js/sdk/okta-signin-widget/${WIDGET_VERSION}
WIDGET_CDN_INTELLIJ=${OKTA_HOME}/okta-core/webapp/target/okta-core.webapp-1.0.0-SNAPSHOT/js/sdk/okta-signin-widget/${WIDGET_VERSION}

# http://atko.okta1.com:1802/assets/js/sdk/okta-signin-widget/next/okta-sign-in.next.js
# ${OKTA_HOME}/okta-core/webapp/target/okta-core.webapp-1.0.0-SNAPSHOT/js/sdk/okta-signin-widget/next/okta-sign-in.next.js
build:
	yarn build

copy-to-tomcat:
	mkdir -p ${WIDGET_CDN} && \
	cp -R ${BUNDLE} ${WIDGET_CDN}

copy-to-intellij:
	mkdir -p ${WIDGET_CDN_INTELLIJ} && \
	cp -R ${BUNDLE} ${WIDGET_CDN_INTELLIJ}

rain: build copy-to-tomcat copy-to-intellij
