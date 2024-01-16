#!/bin/bash

if ! $SKIP_POSTINSTALL || [ -z "$SKIP_POSTINSTALL" ]; then
  exit 1
fi
