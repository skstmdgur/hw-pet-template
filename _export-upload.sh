#!/usr/bin/env bash

set -e

SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
cd "${SCRIPT_DIR}"

UPLOAD=jjfive@192.168.114.4:/volume1/OHLAB/01_KT코딩블록/다티/hw/hw-iframe

TEMP=_tmp
rm -rf $TEMP
mkdir -p $TEMP
do_export(){
    folder=$1    
    $folder/_export.sh
    mv $folder/main/out $TEMP/$folder
    cd $TEMP
    tar zcvf ${folder}.tar.gz $folder

    echo "scp ${folder}.tar.gz ${UPLOAD}"
    scp "${folder}.tar.gz" ${UPLOAD}
    cd ..
}


do_export very-basic-example
do_export marty

echo "rm -rf $TEMP"
rm -rf $TEMP
