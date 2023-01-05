#!/bin/bash

CWD=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PROJECT_ROOT="$CWD/.."
CERTS_DIR="$PROJECT_ROOT/.https"
SCRIPT_NAME="gen-certs"

error () {
  >&2 echo "[$SCRIPT_NAME] $@"
}
print () {
  >&1 echo "[$SCRIPT_NAME] $@"
}

if [ -z $(command -v mkcert) ]; then
	error 'command "mkcert" not found, follow installation instructions here: https://github.com/FiloSottile/mkcert#installation'
	exit 1
fi

# installs the local CA in trust store
sudo mkcert -install && \

mkdir -p $CERTS_DIR && \

# generates cert for localhost
mkcert \
	-cert-file "$CERTS_DIR/localhost-cert.pem" \
	-key-file "$CERTS_DIR/localhost-key.pem" \
	localhost \
	127.0.0.1 \
	::1
