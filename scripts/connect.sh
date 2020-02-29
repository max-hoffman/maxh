#!/bin/bash

set -xeou pipefail

DIR=$(cd $(dirname ${BASH_SOURCE[0]}) && pwd)
WORKDIR=$DIR/..

source $WORKDIR/scripts/env.sh
ssh $MAXH_EC2_PATH
