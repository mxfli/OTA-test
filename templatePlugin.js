/**
 * copy from WapGame/gameserver/templateEngine.js
 * FileName: templatePlugin.js
 * Author: @mxfli
 * CreateTime: 2010-08-04 14:11
 * Description:
 *      Node Template engine Integration,Node templates engines testing and select the best one. Or select for hte feature: CSS HTML tec.
 *      专注引擎的执行部分，不干涉布局信息，布局以及布局的的关系执行顺序在layoutManager中定义。
 * req:
 *      1. bind template engine by type: General Template for HTML and txt, Less (sass) for CSS
 *      2. Impl engine could be replaced by others, and user can Specified template engine.
 *      3. render and return the result by callback method, do not output the result in template engine.
 *
 */


var templatePlugin = module.exports = function () {
    var config = require("./config"),
            engine = require(config.template_engine),
            sys = require("sys");

    var globalOption = {cache : true, compress : true};

    console.log("Init template engine:", config.template_engine);
    console.log("    Template engine", config.template_engine, "options:", JSON.stringify(globalOption));
    if (!globalOption.cache)console.warn("    WARN: Template engine running under no-cache mode");

    function getRenderData(callback) {
        return function (err, data) {
            if (err) {
                callback(err);
            } else {
                var html = "";
                data.on("data", function(fragment) {
                    html += fragment
                })
                        .on("end", function() {
                    callback(err, html);
                });
            }
        };
    }

    return {
        render : function (template, ctx, callback) {
            engine.render(__dirname + config.templates_dir + template, ctx, globalOption, getRenderData(callback));
        },

        //这个方法只能用在 nun 模板引擎下
        ctx : function (template, ctx, outerErrorHandler) {    //outerCallback is next()
            if (config.template_engine !== "nun") throw new Error("This method can be using in nun template engine.");
            return function() {
                return function(context, callback) {
                    templatePlugin.render(template, ctx, function(err, data) {
                        if (err) outerErrorHandler(err);
                        callback(undefined, data);
                    });

                };
            };
        }
    };
}();

