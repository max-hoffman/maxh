#!/bin/bash

set -xeou pipefail

DIR=$(cd $(dirname ${BASH_SOURCE[0]}) && pwd)
WORKDIR=$DIR/..

cd $WORKDIR

hugo --source $WORKDIR --theme=basics --buildDrafts
aws s3 sync --profile maxhai $WORKDIR/public/ s3://maxhai/
