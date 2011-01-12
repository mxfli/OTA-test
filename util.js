/**
 * FileName: util.js
 * Author: @mxfli
 * CreateTime: 2010-10-15 11:13
 * Description:
 *      Description of util.js
 */
var fs = require("fs") ,
        path = require("path");

var util = function() {
    var exports = {};

    exports.patternTime = function(pattern, date) {
        function f(i, j) {
            if (i > 9 || i === 3 && i > 99) {
                return i;
            } else {
                j = j || 2;
                var n = j === 2 ? 100 : 1000;
                return (i / n).toFixed(j).split(".")[1];
            }
        }

        //var star = Date.now();
        date = date || new Date;
        pattern = pattern || "YYYY-MM-DD HH:mm:ss:sss";

        pattern = pattern.replace("YYYY", date.getFullYear());
        pattern = pattern.replace("MM", f(date.getMonth() + 1));
        pattern = pattern.replace("DD", f(date.getDate()));
        pattern = pattern.replace("HH", f(date.getHours()));
        pattern = pattern.replace("mm", f(date.getMinutes()));
        pattern = pattern.replace("ss", f(date.getSeconds()));
        pattern = pattern.replace("sss", f(date.getMilliseconds(), 3));

        return pattern;
    };

    exports.rmdir = function(dir, callback) {
        path.exists(dir, function(exits) {
            if (exits) {
                fs.readdirSync(dir).forEach(function(file) {
                    file = path.join(dir, file);
                    console.log("unlink file:", file);
                    fs.unlinkSync(file);
                });
                fs.rmdir(dir, function(err) {
                    callback(err);
                });
            } else {
                callback();
            }
        })

    };

    //console.log("\nInit utils lib: " + exports.patternTime() + "\n");
    //console.log("\nInit utils lib: " + utils.patternTime() + "\n");
    return exports;
}();

module.exports = util;