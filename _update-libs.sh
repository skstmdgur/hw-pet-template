#!/usr/bin/env bash

set -e

SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
cd "${SCRIPT_DIR}"

LIBS=""
LIBS="${LIBS} @ktaicoder/hw-pet@latest"
LIBS="${LIBS} typescript@^5.2.2"
LIBS="${LIBS} @vercel/style-guide@latest"
LIBS="${LIBS} eslint@latest"
LIBS="${LIBS} next@^13"
LIBS="${LIBS} @next/eslint-plugin-next@latest"
LIBS="${LIBS} eslint-config-turbo"

do_update(){
    folder=$1    
    cd $folder
    pnpm install
    pnpm up -r ${LIBS}
    cd ..
}

do_update very-basic-example
do_update marty
