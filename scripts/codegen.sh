#!/bin/bash

CACHE_FILE=".codegen.sum"

first () {
	awk '{print $1}'
}

# sums a dir
# input: packages/@okta/i18n
# output: d39d70a51af9ccba5710a089f87a4470 packages/@okta/i18n
dir-sum () (
	SUM=$(tar -cf - $@ | md5sum | first)
	echo "$SUM $@"
)

# find a sum from cache
# input: packages/@okta/i18n
# output: d39d70a51af9ccba5710a089f87a4470 packages/@okta/i18n
get-sum () {
	if [ -a $CACHE_FILE ]; then
		grep "$@" $CACHE_FILE
	else
		echo 'none'
	fi
}

# udpates the cache file
update-cache () {
	rm $CACHE_FILE # disable
	dir-sum packages/@okta/i18n >> $CACHE_FILE
	dir-sum src/types >> $CACHE_FILE
}

if [ $(get-sum packages/@okta/i18n | first) != $(dir-sum packages/@okta/i18n | first) ]; then
	echo '[codegen]: changes detected in packages/@okta/i18n'
	yarn grunt propertiesToJSON && \
	yarn generate-config
else
	echo '[codegen]: no changes detected in packages/@okta/i18n'
fi

if [ $(get-sum src/types | first) != $(dir-sum src/types | first) ]; then
	echo '[codegen]: changes detected in src/types'
	yarn build:types
else
	echo '[codegen]: no changes detected in src/types'
fi

update-cache
