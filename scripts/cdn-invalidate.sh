#!/bin/bash

set -xeou pipefail

DIR=$(cd $(dirname ${BASH_SOURCE[0]}) && pwd)
WORKDIR=$DIR/..
DISTRIBUTION_ID=E1B7V7FINIAFUR

cd $WORKDIR

aws cloudfront create-invalidation \
    --profile maxhai \
    --distribution-id $DISTRIBUTION_ID \
    --paths "$@"
