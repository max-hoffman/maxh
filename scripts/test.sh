#!/bin/bash

set -xeou pipefail

DIR=$(cd $(dirname ${BASH_SOURCE[0]}) && pwd)
WORKDIR=$DIR/..

cd $WORKDIR

docker run --rm -it \
    -v $(pwd):/src \
    -p 1313:1313 \
    klakegg/hugo:0.74.0 \
    server \
    --forceSyncStatic \
    -D \
    --gc
