//show runtime info on console every 1 minute
var express = require('express');
(function appInfo() {
    //print app info on the console
    console.log("\n#############################################");
    console.log("## ", config.appName, config.version);
    console.log('##  Running under "Express" middleware');
    console.log('##  Express version:', express.version);
    console.log('##  Node.js version:', process.version);
    console.log("#############################################\n");

    function sysInfo() {
        console.log("System memory usage:", (process.memoryUsage().rss / (1024 * 1024)).toFixed(2), "Mb");
    }

    process.title = config.appName;
    sysInfo();

    setInterval(sysInfo, 1000 * 600);
})();
