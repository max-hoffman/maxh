#!/bin/bash

set -xeou pipefail

DIR=$(cd $(dirname ${BASH_SOURCE[0]}) && pwd)
WORKDIR=$DIR/..

cd $WORKDIR

source $WORKDIR/scripts/env.sh
hugo --source $WORKDIR --theme=basics --buildDrafts
rsync -avz --delete $WORKDIR/public/ $MAXH_EC2_PATH:/home/ubuntu/maxh/public/
