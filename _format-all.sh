#!/usr/bin/env bash

set -e

SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
cd "${SCRIPT_DIR}"

do_format(){
    folder=$1    
    cd $folder
    pnpm format
    cd ..
}

do_format very-basic-example
do_format marty
