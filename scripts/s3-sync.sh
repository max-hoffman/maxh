#!/bin/bash

set -xeou pipefail

DIR=$(cd $(dirname ${BASH_SOURCE[0]}) && pwd)
WORKDIR=$DIR/..

cd $WORKDIR

docker run --rm -it \
    -v $(pwd):/src \
    klakegg/hugo:0.73.0 \
    build \
    --forceSyncStatic \
    --cleanDestinationDir \
    -D \
    --gc

aws s3 sync --profile maxhai $WORKDIR/public/ s3://maxhai/
