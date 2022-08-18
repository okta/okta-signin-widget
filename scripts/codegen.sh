#!/bin/bash

CACHE_FILE=".codegen.sum"

first () {
	awk '{print $1}'
}

dir-sum () (
	SUM=$(tar -cf - $@ | md5sum | first)
	echo "$SUM $@"
)

get-sum () {
	grep "$@" $CACHE_FILE | first
}

update-cache () {
	rm $CACHE_FILE # disable
	dir-sum packages/@okta/i18n >> $CACHE_FILE
	dir-sum src/types >> $CACHE_FILE
}

if [ $(get-sum src/types) != $(dir-sum src/types | first) ]; then
	echo '[codegen]: changes detected in src/types'
	yarn build:types
	# update-cache types
else
	echo '[codegen]: no changes detected in src/types'
fi

if [ $(get-sum packages/@okta/i18n) != $(dir-sum packages/@okta/i18n | first) ]; then
	echo '[codegen]: changes detected in packages/@okta/i18n'
	yarn grunt propertiesToJSON && \
	yarn generate-config
	# update-cache packages/@okta/i18n
else
	echo '[codegen]: no changes detected in packages/@okta/i18n'
fi

update-cache && cat $CACHE_FILE
