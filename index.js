/**
 * FileName: index.js
 * Author: @mxfli
 * CreateTime: 2010-09-27 18:07
 * Description:
 *      1. ota Server application:
 *          a) init & Start server
 *          b) show server global information
 *          c) Show server memory usage information
 *      2. URL mapping: ota admin and wap download
 *
 * OTA的安装
 *      1. 需要NodeJS v 0.4.0 以上版本,express 2.0+
 *      2. 安装 NPM NodeJS 包管理器
 *      3. 用NPM安装依赖的包：express(web服务器实现), formidable(Node处理文件上传的包) ,nun模板处理
 *      4. 上传app目录到服务器指定目录
 *
 * OTA服务启动：
 *      1. 终端下执行命令： node (path to ota app)/index.js | tee -a ota.log &
 *      注：启动必须按照上述方式执行，启动后可以关闭当前终端，不影响服务器。
 * 只执行node index.js关闭终端时会阻塞程序运行
 */

var express = require("express"),
        config = require("./config.js"),
        ota = require("module/ota.js"),
        path = require("path"),
        url = require("url");

//init server
var otaApp = express.createServer(
        express.logger({format:":remote-addr :date :method :status :url :res[Content-Type]"}),
        express.bodyParser(),
        express.static(__dirname + "/www")
        );
otaApp.use(express.cookieParser());
otaApp.use(express.session({ secret: 'ota_23@han_joy' }));

//print app info on the console
(function () {
    console.log("\n#############################################");
    console.log("## ", config.appName, config.version);
    console.log('##  Running under "Express" middleware');
    console.log('##  Express version:', express.version);
    console.log('##  Node.js version:', process.version);
    console.log("#############################################\n");
})();


//show runtime info on console every 1 minute
(function () {
    function sysInfo() {
        console.log("System memory usage:", (process.memoryUsage().rss / (1024 * 1024)).toFixed(2), "Mb");
    }

    process.title = "ota";
    sysInfo();

    setInterval(sysInfo, 1000 * 600);
})();

otaApp.get("/login", function(req, res, next) {
    if (req.session.user) {
        res.send(req.session.user);
    } else {
        res.send("0");
    }
});

otaApp.post("/login", function(req, res, next) {
    var name = req.param("name"),
            password = req.param("password");
    console.log("name:", name, "password:", password);
    if (name === config.user.name && password === config.user.password) {
        req.session.user = "管理员";
        res.send(req.session.user);
    } else {
        res.send("0");
    }
});

//Ajax得到机型数据
otaApp.get("/mobiles.json", function(req, res) {
    res.sendfile(__dirname + "/mobiles.json");
});

//增加机型，成功返回1，失败返回0
otaApp.get("/mobiles.add", ota.sessionCheck, function(req, res) {
    res.send("OTA 增加机型未实现，请手动增加。");
});

//列出
otaApp.get("/list", ota.sessionCheck, function(req, res) {
    res.send(ota.getJSONUploads());
});

//删除不需要的上传
otaApp.get("/delete/:oid", ota.sessionCheck, function(req, res) {
    ota.del(req.params.oid, function(result) {
        res.send(result)
    })
});

//删除全部上传内容
otaApp.get("/deleteAll", function(req, res) {
    res.send("OTA 删除所有的文件，未实现");
});


//上传OTA游戏
otaApp.post("/upload", ota.sessionCheck, ota.upload);


//WAP下载具体的游戏：JAD or JAR文件
otaApp.get("/wap/download/:oid/:mobile/*", function(req, res, next) {
    var oid = req.param("oid"),mobile = req.param("mobile"),extName = path.extname(url.parse(req.url)["pathname"]);
    if (oid) {
        oid = parseInt(oid, 10);
        //todo referrer does not work, need more tests.
        res.referrer = req.headers.referrer || req.headers.referer || "/wap/" + oid;
        //console.log(JSON.stringify(req.headers));
        ota.download(res, oid, mobile, extName.toUpperCase().replace(".", ""), function(err) {
            next(err)
        });
    } else {
        next();
    }
});


//显示具体的游戏中的机型信息这个需要分页
otaApp.get("/wap/:oid?/:page?", function(req, res, next) {
    var oid = req.param("oid"),page = req.param("page");
    if (oid) {
        page = page ? parseInt(page, 10) : 1;
        //res.send(req.url)
        ota.wapList(res, parseInt(oid, 10), page);
    } else {
        next();
    }
});

//WAP 默认页面处理:显示OTA上传内容，只显示最后的10个，不需要分页
otaApp.get("/wap", ota.wap);

//启动服OTA服务
otaApp.listen(config.port);

console.log("\n", config.appName, "listen on port:", config.port, "\n");

process.on('uncaughtException', function (err) {
    console.log("time:", new Date(), 'Caught exception: ' + err);
});
