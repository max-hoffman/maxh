#!/bin/bash

set -xeou pipefail

DIR=$(cd $(dirname ${BASH_SOURCE[0]}) && pwd)
WORKDIR=$DIR/..

cd $WORKDIR

hugo --source $WORKDIR --theme=basics --buildDrafts
aws s3 cp --recursive --profile maxhai $WORKDIR/public/ s3://maxhai/
