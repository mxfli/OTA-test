/**
 * FileName: config.js
 * Author: @mxfli
 * CreateTime: 2010-09-27 19:12
 * Description:
 *      Description of config.js
 */

var config = module.exports = {
    appName             : "OTAServer",
    version             : "v0.1.8 beta",
    debug               : false,
    user                : {name:"admin",password:"admin"},
    //run wap server behind the nginx proxy server
    host                : null, // The value "null" will bind all ip include 127.0.0.1
    port                : 8000,
    templates_dir       : "/template",
    live_demo_dir       : "/www",
    template_engine     : "nun"
};