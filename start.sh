#!/bin/sh

baseDir=$(dirname $0)
appRunning=$(pstree | grep ota | wc -l)

if [ "$appRunning" -gt 0 ]; then

    if [ "$1" = "stop" ]; then
        echo "stopping ota server ..."
        killall -vw ota
    else
        echo "restart ota server..."
        killall -vw ota && node $baseDir/index.js | tee -a $baseDir/ota.log &
    fi
else
    echo "start ota server..."
    node $baseDir/index.js | tee -a $baseDir/ota.log &
fi

exit 0