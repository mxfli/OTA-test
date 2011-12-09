/**
 * FileName: common.js
 * Author: @mxfli
 * CreateTime: 2010-08-15 00:52
 * Description:
 *      Including common files, others should include this file.
 */

var myUtil = require("./util.js");
var sysUtil = require("util");

//var util = Object.create(sysUtil, myUtil.prototype);
Object.keys(myUtil).forEach(function(key) {
    sysUtil[key] = myUtil[key];
});

global.util = sysUtil; //merge node utils and custom utils.
global.config = require("./config/config.js");
global.assert = require("assert");
