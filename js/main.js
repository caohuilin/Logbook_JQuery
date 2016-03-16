;(function($){

    //根据mood显示对应的心情
    function mood_img_src(mood) {
        if (!mood) {
            return '';
        }
        return {
            grinning: "/img/mood1.png",
            smile: "/img/mood2.png",
            neutral_face: "/img/mood3.png",
            disappointed: "/img/mood4.png"
        }[mood];
    }

    //日期
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth()+1;
    var date = now.getDate();
    if(month<10){
        month = "0" + month;
    }
    if(date<10){
        date = "0" + date;
    }
    var dates =  year+"-"+month+"-"+date;
    $(".rightArea .date").html(dates);
    getInfo();

    //日历
    $('.date div').datepicker({
        format:'yyyy-mm-dd',
        todayHighlight:true
    }).on('changeDate', function () {
        dates = $(this).datepicker('getFormattedDate');
        $(".rightArea .date").html(dates);
        getInfo();
    });

    function getInfo() {

        var depart = [];//存储部门的数组
        var user = [];//存储用户
        var depart_user = {};//通过部门找到所有用户
        var user_note = {};//通过部门找到日志
        var id_user = {};//通过id找用户
        var name_user = {};//通过name找用户
        //部门
        $.get("http://96a8to7r.apps.qbox.me/departments", function (departments) {
            $.each(departments.data, function (i, de) {
                depart.push(de);
                depart_user[de] = [];
            });
            //用户
            $.get("http://96a8to7r.apps.qbox.me/users", function (users) {
                $.each(users.data, function (i, us) {
                    id_user[us.id] = us;
                    name_user[us.real_name] = us;
                    user_note[us.id] = [];
                    if (us.department) {
                        depart_user[us.department].push(us);
                    }
                });
                $.get("http://96a8to7r.apps.qbox.me/posts?day=" + dates, function (note) {
                    if (note.data) {
                        $.each(note.data, function (i, no) {
                            user_note[no.user_id].push(no);
                        });
                    }
                    var html1 = "";
                    var html2 = "";
                    for (var i = 0; i < depart.length; i++) {
                        html1 += "<li>" + depart[i] + "<div class='num'>共" + depart_user[depart[i]].length + "人</div></li><ul class='gs'>";
                        html2 += "<li>" + depart[i] + '( ' + depart_user[depart[i]].length + ' )' + "</li><ul class='gd'>"
                        for (var j = 0; j < depart_user[depart[i]].length; j++) {
                            var us = depart_user[depart[i]][j];
                            html1 += "<li><div class='name'>姓名：" + us.real_name + "</div>";
                            html2 += "<li>" + us.real_name + "</li>";
                            if (user_note[us.id].length > 0) {
                                html1 += "<div class='mood'>心情："+ mood_img_src(user_note[us.id].mood) +"</div><div class='note'><div>日志：</div><div class='noteCon'>"+ marked(user_note[us.id][0].content) +"</div></div>"
                                //html1 += "<div class='mood'>心情：<img src='" + mood_img_src(user_note[us.id].mood) + "'></div><div class='note'>日志：<div class='noteCon'>" + user_note[us.id].content + "</div></div>"
                            } else {
                                html1 += "<div class='mood'>心情：</div><div class='note'>日志:</div>";
                            }
                            html1 += "</li>";
                        }
                        html1 += "</ul>";
                        html2 += "</ul>";
                    }
                    $(".departments").html(html1);
                    $(".c_de").html(html2);

                    //每个部门条目的点击事件
                    var show = -1;
                    var flag = 1;
                    var de = $(".departments >li");
                    var us = $(".gs");
                    $.each(de, function (i, d) {
                        de.eq(i).on("click", function () {
                            if (show != -1) {
                                us.eq(show).css("display", "none");
                            }
                            if (show == i) {
                                if (flag) {
                                    us.eq(show).css("display", "none");
                                    flag = 0;
                                }
                                else {
                                    us.eq(show).css("display", "block");
                                    flag = 1;
                                }
                            } else {
                                show = i;
                                us.eq(i).css("display", "block");
                                flag = 1;
                            }
                        });

                    });

                    //左边区域的点击事件
                    var show2 = -1;
                    var flag2 = 1;
                    var de2 = $(".c_de >li");
                    var us2 = $(".gd");
                    $.each(de2, function (i, d) {
                        de2.eq(i).on("click", function () {
                            if (show2 != -1) {
                                us2.eq(show2).css("display", "none");
                            }
                            if (show2 == i) {
                                if (flag2) {
                                    us2.eq(show2).css("display", "none");
                                    flag2 = 0;
                                }
                                else {
                                    us2.eq(show2).css("display", "block");
                                    flag2 = 1;
                                }
                            } else {
                                show2 = i;
                                us2.eq(i).css("display", "block");
                                flag2 = 1;
                            }
                        });
                    });
                    //左边区域点击人的事件
                    var us_notes = [];
                    var gd = $(".gd >li");
                    $.each(gd, function (i, d) {
                        gd.eq(i).on("click", function () {
                            var name = gd.eq(i)[0].innerHTML;
                            var id = name_user[name].id;
                            $.get("http://96a8to7r.apps.qbox.me/posts?uid=" + id, function (notes) {
                                $.each(notes.data, function (i, note) {
                                    //debugger
                                    us_notes.push(note);
                                });

                                var html3 = "<div class='name'>" + name_user[name].real_name + "</div><div class='de'>--" + name_user[name].department + "</div><div class='note_nav'>";
                                for (var i = 0; i < us_notes.length; i++) {
                                    html3 += "<li>" + us_notes[i].day + "</li><div class='notess'><div class='mo'>心情：<img src='" + mood_img_src(us_notes[i].mood) + "'></div><div class='rizhi'>日志：<div class='con'>" + marked(us_notes[i].content) + "</div></div><div class='comment'><a id='see_com" + id + j + "'>查看所有评论</a><div class='all_com' id='com" + id + j + "'>暂无评论</div></div><div class='add_comment'><a id='add_com" + id + j + "'>添加评论</a></div></div>"
                                }
                                html3 += "</div>";
                                $(".rightArea").html(html3);

                                //点击时间显示日志事件
                                var show3 = -1;
                                var flag3 = 1;
                                var gd2 = $(".note_nav >li");
                                var no2 = $(".notess");
                                $.each(gd2, function (k, d) {
                                    gd2.eq(k).on("click", function () {
                                        if (show3 != -1) {
                                            no2.eq(show3).css("display", "none");
                                        }
                                        if (show3 == k) {
                                            if (flag3) {
                                                no2.eq(show3).css("display", "none");
                                                flag3 = 0;
                                            }
                                            else {
                                                no2.eq(show3).css("display", "block");
                                                flag3 = 1;
                                            }
                                        } else {
                                            show3 = k;
                                            no2.eq(k).css("display", "block");
                                            flag3 = 1;
                                        }
                                    });
                                });

                            });
                        });
                    })
                });
            });
        });


        //个人信息
        $.get("http://96a8to7r.apps.qbox.me/user/overview", function (user) {
            var us = user.data;
            var html = "<li>" + us.real_name + "</li><li>" + us.department + "</li>";
            $("#change_dep").before(html);
        });

        //个人信息的点击事件
        var flag = 1;
        $("#inf").on('click', function () {
            if (flag) {
                $("#user").show();
                flag = 0;
            } else {
                $("#user").hide();
                flag = 1;
            }
        });

        //我的日志的点击事件
        $("#note").on('click', function () {
            $("#mask").show();
            $("#popup").show();
        });
        $(".icon").on('click', function () {
            $("#mask").hide();
            $("#popup").hide();
        });
        $(".certern").on("click", function () {
            $("#mask").hide();
            $("#popup").hide();
        });
        $("#mask").on("click", function () {
            $("#mask").hide();
            $("#popup").hide();
        });


        //两边分开进行鼠标控制
        $(".leftArea").hover(function () {
            if ($(".leftArea").hasClass("po_fx"))
                $(".leftArea").removeClass("po_fx");
            $(".rightArea").addClass("po_fx_l");
        });
        $(".rightArea").hover(function () {
            if ($(".rightArea").hasClass("po_fx_l"))
                $(".rightArea").removeClass("po_fx_l");
            $(".leftArea").addClass("po_fx");
        });
    }
})(jQuery);
