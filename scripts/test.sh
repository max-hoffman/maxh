#!/bin/bash

set -xeou pipefail

DIR=$(cd $(dirname ${BASH_SOURCE[0]}) && pwd)
WORKDIR=$DIR/..

cd $WORKDIR

docker run --rm -it \
    -v $(pwd):/src \
    klakegg/hugo:0.73.0 \
    -p 1313:1313 \
    server \
    --forceSyncStatic \
    --cleanDestinationDir \
    -D \
    --gc
