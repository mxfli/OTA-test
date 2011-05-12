/**
 * FileName: ota.js
 * Author: @mxfli
 * CreateTime: 2010-10-15 11:47
 * Description:
 *      OTA 业务逻辑在此实现
 *      1. 加载是加载JSON文件：数据文件
 *      2. 上传或删除是更新数据文件，并回写到JSON文件
 *      3. WAP 访问和下载功能
 */

var fs = require("fs"),
        sys = require("sys"),
        path = require("path"),
        config = require("./config"),
        formidable = require("formidable"),
        otaUtil = require("./util"),
        templateEngine = require("./templatePlugin.js"),
        WML_MIME_TYPE = "text/vnd.wap.wml;charset=UTF-8";

var ota = function() {
    var uploads,lastId = 1;

    //Infinity OTA data form data file "./data.json"
    fs.readFile(__dirname + "/data.json", function(err, data) {
        if (err) throw err;
        var script = JSON.parse(data.toString("utf8"));

        uploads = script.uploads;
        lastId = script.lastId;
        console.log("Loading OTA data from './data.json' ......");
        console.log("OTA lastId:", lastId, "\nOTA uploads:", sys.inspect(uploads));
        console.log("OTA data loaded.")
    });

    //execute when Not matching any record in data.json
    function dbError(res) {
        templateEngine.render(
                "/500.html",
                {version:config.version ,date:otaUtil.patternTime("MM月DD日 HH:mm", new Date())},
                function(err, html) {
                    res.writeHead(500, {"content-type": WML_MIME_TYPE});
                    res.end(html);
                });
    }

    /**
     * Find obj with custom condition tester
     * @param tester  custom tester
     * @param callback do callback when match or not find with the tester.
     */
    Array.prototype.findObj = function(tester, callback, errHandler) {
        var found = this.some(function(e, index) {
            if (tester(e)) {
                callback(e, index);
                return true;
            }
        });
        if (!found) {errHandler();}
    };

    var exports = {};

    //delete upload ota files
    exports.del = function(id, callback) {
        console.log("del called.");
        uploads.findObj(
                function(upload) {
                    return upload.oid === parseInt(id, 10)
                },
                function(upload, index) {
                    otaUtil.rmdir(__dirname + upload["path"],
                                  function(err) {
                                      if (err) {
                                          callback("");
                                      } else {
                                          console.log("del:", upload["title"], "dir:", upload["path"]);
                                          uploads.splice(index, 1);
                                          fs.writeFile(__dirname + "/data.json",
                                                       JSON.stringify({lastId:lastId,uploads:uploads}),
                                                       "utf8");
                                          callback("OK");
                                      }
                                  });
                },
                callback.bind(null, ""));
    };

    //Upload ota files
    //TODO(mxfli) implement xhr upload in client and server side
    //TODO(mxfli) Refactor all method to simple and short functions: write json file read json file.
    exports.upload = function(req, res, next) {
        console.log("upload called.");
        var form = new formidable.IncomingForm(),
                oid,otaPath,datetime;
        form.uploadDir = __dirname + "/tmp";

        form.parse(req, function(err, fields, files) {
            if (err) {
                next(err);
            } else {
                //init ota fields
                oid = lastId;
                lastId = lastId + 1;
                datetime = Date.now(); //use for data
                otaPath = __dirname + "/uploads/" + otaUtil.patternTime("YYYYMMDD", new Date(datetime)) + "_" + oid;

                var mobiles = {};

                //make dir for the upload files
                path.exists(otaPath,
                            function(exists) {
                                if (!exists) {
                                    fs.mkdirSync(otaPath, 777);
                                }

                                var mobileType;

                                Object.keys(files).forEach(function(key) {
                                    mobileType = key.split("_")[0];
                                    if (!mobiles.hasOwnProperty(mobileType)) {
                                        mobiles[mobileType] = {mobileType:mobileType};
                                    }
                                    //mobiles[mobileType][key.split("_")[1]] = otaPath + "/" + files[key]["filename"];
                                    console.log("upload filename:", files[key]["filename"]);
                                    mobiles[mobileType][key.split("_")[1]] = files[key]["filename"];
                                    fs.renameSync(files[key]["path"], otaPath + "/" + files[key]["filename"]);
                                    //console.log("Old file", files[key]["path"], " save to file", otaPath + "/" + files[key]["filename"]);
                                });

                                //console.log("uploads struct :\n", sys.inspect(mobiles));
                                var result = [];

                                Object.keys(mobiles).forEach(function(key) {
                                    result.push(mobiles[key]);
                                });

                                uploads.unshift({oid:oid,title:fields["title"],datatime:Date.now(),path:otaPath.replace(__dirname, ""),mobiles:result});


                                //res.writeHead(200, {'content-type': 'text/html'});
                                //res.end(sys.inspect(uploads[0]));
                                //console.log(sys.inspect({lastId:lastId,uploads:uploads}));

                                fs.writeFile(__dirname + "/data.json", JSON.stringify({lastId:lastId,uploads:uploads}), 'utf8', function(err) {
                                    if (err)console.log("save data.json err", err);
                                });

                                res.redirect("/#list");
                            }
                        );
            }
        });
    };


    //return uploaded to the caller
    exports.getJSONUploads = function() {
        return JSON.stringify(uploads);
    };


    //wap 默认页面：列出最后上传的10项内容
    exports.wap = function(req, res, next) {
        //console.log("wap called.");

        var ctx = {title:"File-list", version:config.version};
        ctx.date = otaUtil.patternTime("MM月DD日 HH:mm", new Date());

        var result = [];
        uploads.some(function(upload) {
            result.push(upload);
            return result.length > 10;
        });

        //console.log("uploads:", result);

        ctx.body = templateEngine.ctx("/ota_list.html", {uploads:result}, function(err) {
            throw err
        });
        templateEngine.render("/layout.html", ctx, function(err, html) {
            if (err) next(err);
            res.writeHead(200, {"content-type": WML_MIME_TYPE});
            res.end(html);
        });

    };

    //the data of wap default page
    exports.wapList = function(res, oid, page) {
        var upload,ctx = {title:"OTA-Err"},pageSize = 10,pageCount = 1;
        ctx.date = otaUtil.patternTime("MM月DD日 HH:mm", new Date());

        for (var i = 0; upload = uploads[i]; i++) {
            if (upload.oid === oid) {

                ctx.title = "Name:" + upload["title"];
                var subCtx = {oid:upload.oid,mobiles:upload.mobiles};

                pageCount = Math.ceil(upload.mobiles.length / pageSize);

                if (pageCount > 1) {
                    subCtx.page = {page:true,
                        pageNum:page,
                        pages:function() {
                            var result = [];
                            for (var j = 1; j <= pageCount; j++) {
                                result.push({link:" <a href='/wap/" + oid + "/" + j + "'>" + j + "</a> "});
                            }
                            return result;
                        }};
                    subCtx.mobiles = function() {
                        console.log("pagging...");
                        var result = [];
                        for (var i = (page - 1) * pageSize; i < upload.mobiles.length && i < page * pageSize; i++) {
                            result.push(upload.mobiles[i]);
                        }
                        return result;
                    }
                }
                ctx.body = templateEngine.ctx("/mobiles_list.html", subCtx, function(err) {
                    throw err
                });
                break;
            }
        }

        templateEngine.render("/layout.html", ctx, function(err, html) {
            if (err) next(err);
            res.writeHead(200, {"content-type": WML_MIME_TYPE});
            res.end(html);
        });

    };


    //JAD & JAR files download
    exports.download = function(res, oid, mobileType, fileType, cb) {
        //render 404 download page when data.json is right and file not exists.
        function notFound(upload, mobile) {
            templateEngine.render("/404.html",
                                  {otaTitle:upload.title
                                      ,mobileType:mobile.mobileType
                                      ,filename:mobile[fileType]
                                      ,referrer:res.referrer
                                      ,version:config.version
                                      ,date:otaUtil.patternTime("MM月DD日 HH:mm", new Date())},
                                  function(err, html) {
                                      res.writeHead(404, {"content-type": WML_MIME_TYPE});
                                      res.end(html);
                                  });
        }


        //Download jad file or jar file.
        function downloadFile(uploadOTA, mobile) {
            var JAD_MIME_TYPE = "text/vnd.sun.j2me.app-descriptor;charset=UTF-8";
            var filename = __dirname + uploadOTA["path"] + "/" + mobile[fileType];
            //console.log("download", fileType, " file", filename.replace(__dirname, ""));

            path.exists(filename, function(exists) {
                if (exists) {
                    if (fileType === "JAD") {
                        fs.readFile(filename,
                                    function(err, jadContent) {
                                        if (err)cb(err);
                                        res.writeHead(200, {"content-type": JAD_MIME_TYPE});
                                        res.end(jadContent);
                                    });
                    } else {
                        res.download(filename, mobile[fileType]);
                    }
                } else {
                    notFound(uploadOTA, mobile);
                }
            });
        }


        uploads.findObj(function(upload) {
            return upload.oid === oid
        },
                        function(uploadedOTA) {
                            uploadedOTA.mobiles.findObj(function(mobile) {
                                return mobile.mobileType === mobileType
                            },
                                                        downloadFile.bind(null, uploadedOTA),
                                                        dbError.bind(null, res));
                        },
                        dbError.bind(null, res));
    };


    //session check filter
    exports.sessionCheck = function(req, res, next) {
        console.log("start session fileter for URL:", req.url);
        if (req.session.user) {
            next();
        } else {
            if (req.xhr) {
                res.send("0");
            } else {
                res.send();
            }
        }
    };


    return exports;

}();

module.exports = ota;