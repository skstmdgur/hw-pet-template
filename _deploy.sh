#!/usr/bin/env bash

set -e

SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
cd "${SCRIPT_DIR}"

TEMP=_tmp
rm -rf ${TEMP}
mkdir -p ${TEMP}

do_export() {
    hwId=$1
    $hwId/_purge.sh
    $hwId/_export.sh
    mv $hwId/main/out ${TEMP}/${hwId}
    cd ${TEMP}
    tar zcvf ${hwId}.tar.gz ${hwId}
    cd ..
    echo
    echo "[${hwId}] Build successfully"
    echo
}

do_export marty
do_export exMarsCube

DEPLOY_SERVER=https://aicodiny.com

do_deploy() {
    hwId=$1
    echo "start deploy ${hwId}.tar.gz"
    curl -F "file=@$TEMP/${hwId}.tar.gz;filename=${hwId}.tar.gz" \
        -F 'shiftSingleTopFolder=true' \
        -H "x-dati-api-token: ${DATI_API_TOKEN}" \
        $DEPLOY_SERVER/aimk-server/p/api/dati/extract/hw-iframe/${hwId}
    echo
    echo "[${hwId}] Deployed successfully"
    echo
}

if [ -z "$DATI_API_TOKEN" ]; then
    echo ""
    echo "[error] Api token required for deployment"
    exit 1
fi

do_deploy marty
do_deploy exMarsCube

echo "rm -rf ${TEMP}"
rm -rf ${TEMP}

