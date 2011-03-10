/**
 * OTA client JS for the web
 * Author: mxfli
 * Date: 10-10-12
 * Time: 上午8:53
 */

function initOta() {

    //Ajax login
    function login() {
        var name = $("input[name=name]").val(),
                password = $("input[name=password]").val(),
                data = {name:name,password:password};

        $.post("/login", data, function(responseData) {
            if (responseData === "0") {
                alert("用户名或密码错误！");
            }
            userInfo(responseData);
        });
    }


    //Check current session: if user has login return user's Info.
    function userInfo(data) {
        if (data === "0") {
            $("#userInfo").empty().hide();
            $("#login").show();
            $("input[name=name]").focus();
            $("input[name=password]").val("");
        } else {
            $("#login").hide();
            $("#userInfo").html("用户：" + data).show();
        }
        loadList();
    }

    //bind click for login button
    $("#login :button").click(login);
    $("input[name=password]").keypress(function (event) {
        if (event.keyCode === 13) {login.apply()}
    });
    //check login state when page is ready
    $.get("/login", userInfo);


    //get mobiles list form the server by ajax
    $.getJSON("/mobiles.json",
              function (d) {
                  $("#mobiles").html(d.map(
                                          function (v) {
                                              return  "<li><label><input type='checkbox' name=\'mobiletype\' value=\'" + v + "\' > " + v + "</label></li>";
                                          }).join(""));
              });

    //TODO(mxfli) use Event "onhashchange" : location hash change event.
    //load uploaded oat items form the server by ajax request.
    function loadList() {
        if (window.location.href.indexOf("#list") !== -1)
            $.getJSON("/list",
                      function(data) {
                          $("#list").show();
                          $("#up").hide();
                          $("li.list").remove();
                          //TODO(mxfli) use jQuery table template
                          data.forEach(
                                      function(mobile, index) {
                                          $("<li></li>")
                                                  .addClass("list")
                                                  .addClass("list" + (index % 2))
                                                  .append("<span>" + mobile.title + "</span>")
                                                  .append("<span>" + patternedDate("YYYY-MM-DD HH:mm:ss", new Date(mobile.datatime)) + "</span>")
                                                  .append(
                                                  $("<span></span>")
                                                          .css("textAlign", "center")
                                                          .append($("<input type='button'>")
                                                                          .attr("value", "删除")
                                                                          .click(
                                                                                function() {
                                                                                    if (confirm("确认删除 \"" + mobile.title + "\"？")) {
                                                                                        $.get("/delete/" + mobile.oid, {}, function(data) {
                                                                                            if (data === "OK") {
                                                                                                loadList();
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                })))
                                                  .appendTo("#list ul");
                                      });
                      });
    }


    //如果地址中有#list锚链接 加载手机列表数据，一次加载完成部分也

    //隐藏/显示 手机型号
    $("#mobilesSwitch").click(
                             function() {
                                 var mobilesManage = $("#mobilesManage");
                                 if (mobilesManage.is(":visible")) {
                                     mobilesManage.hide(200);
                                 } else {
                                     mobilesManage.show(200);
                                 }
                             });


    //全部选中手机的切换功能
    $("#allSwitch").click(function () {
        if ($(this).is(":checked")) {
            $(":checkbox[name=mobiletype]").attr("checked", "checked");
        } else {
            $(":checkbox[name=mobiletype]").removeAttr("checked");
        }
        checkedStyle();
    });

    //单独选中切换功能
    $("#mobiles").click(function() {
        checkedStyle();
    });

    //生成OTA上传表单
    $(":button[name=click]").click(function() {

        var checkedMobiles = $(":checked[name=mobiletype]");
        if (checkedMobiles.length > 0) {
            $("#mobileInputs").empty();
            checkedMobiles.each(function() {
                $("<div>").css("height", "25px")
                        .append($("<span>" + this.value + "</span>").addClass("mobile"))
                        .append(('<span> <label>JAD <input name="' + this.value + '_JAD" type="file" accept="application/jad"></label></span>'))
                        .append(('<span> <label>JAR <input  name="' + this.value + '_JAR" type="file" accept="application/jaR"></label></span>'))
                        .appendTo("#mobileInputs");
                //console.log("add new ", this.value);
            });
            $("#mobilesManage").hide(300);
            $("form input:text").focus().select();
        } else {
            alert("请选择要上传的手机型号！");
        }
    });

    //提交表单是的校验工作
    $("form").submit(function() {
        //必须修改标题，标题不能为空
        var title = this.title.value;
        if (title === "" || title === "请输入标题") {
            alert("请输入标题");
            this.title.focus();
            $(this.title).select();
            return false;
        }

        //必须选择手机型号
        if ($("form input:file").length === 0) {
            alert("请选择手机型号");
            return false;
        }


        //必须为选定的手机型号选择文件
        var files = $("form input:file");
        for (var i = 0,file; file = files[i]; i++) {
            //console.log(file.name, file.value);
            if (file.value === "") {
                alert("还没有为 " + file.name.split("_")[0] + " 选择 " + file.name.split("_")[1] + " 文件！");
                $(file).click();
                return false;
            }
        }
    });

    //切换到手机列表
    $("a[href=\"#list\"]").click(loadList);


    //切换到上传表单
    $("a[href=\"#upload\"]").click(function() {
        $("#list").hide();
        $("#up").show();

    });
}

//手机类型中被选中的样式切换功能
function checkedStyle() {
    $(":checkbox[name=mobiletype]").parent().parent().removeClass("selected");
    $(":checked[name=mobiletype]").parent().parent().addClass("selected");
}


//格式化日期的函数
function patternedDate(pattern, date) {
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
}

//页面加载完成时执行 initOta函数，完成客户端的初始化功能
$("body").ready(initOta);

