#!/bin/bash

export NPM_PACKAGES="${HOME}/.npm-packages"
export NODE_PATH="$NPM_PACKAGES/lib/node_modules:$NODE_PATH"

export PATH="$NPM_PACKAGES/bin:$PATH"

cw-custom-metrics/nginx.cloudwatch.js
cw-custom-metrics/process.cloudwatch.js
cw-custom-metrics/diskspace.cloudwatch.js
