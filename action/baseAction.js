/**
 * FileName: baseAction.js
 * Author: @mxfli
 * CreateTime: 2011-12-09 22:06
 * Description:
 *      Description of baseAction.js
 */
var ota = require("../module/ota.js");

exports.registerActions = function (app, templateEngine) {
    app.get("/", function (req, res, next) {
        next(new Error("method not implements."));
    });
};