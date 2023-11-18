#!/usr/bin/env bash

set -e

SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
cd "${SCRIPT_DIR}"

do_purge(){
    folder=$1    
    sh $folder/_purge.sh
}

do_purge very-basic-example
do_purge marty
