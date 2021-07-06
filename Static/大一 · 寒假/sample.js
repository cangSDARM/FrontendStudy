/**
 * Created by 64838 on 2018/4/6.
 */
function SwitchDiv(self) {
  var s = $("#" + $(self).val());
  s.removeClass("hide");
  s.siblings().addClass("hide");
}

function Scroll() {
  var sc = $(window).scrollTop();
  var dao = $("div.dao");
  if (sc > $("#title").outerHeight()) {
    dao.addClass("fixed");
  } else {
    if (dao.hasClass("fixed")) {
      dao.removeClass("fixed");
    }
  }

  $("#inner")
    .children()
    .each(function () {
      var $winTop = $(this).offset().top - sc;
      if ($winTop < $(this).innerHeight() / 2) {
        var a = dao.children("a." + $(this).attr("id"));
        a.addClass("cur");
        a.siblings().removeClass("cur");
        return;
      }
    });

  //窗口高度：$(window).height();
  //整个文档高度：$(document).height();
  //滚动到底时：windowHeight + documentHeight = scrollTop;
}
function ToTop() {
  $(window).scrollTop(0);
}

function Show() {
  var ele = document.getElementsByClassName("div");
  for (var i = 0; i < ele.length; i++) {
    ele[i].classList.remove("hide");
  }
}
function Eixt() {
  var ele = document.getElementsByClassName("div");
  for (var i = 0; i < ele.length; i++) {
    ele[i].classList.add("hide");
  }
}

function MouseDown() {
  var obj = $(".ex03 > header");

  var startX = event.screenX;
  var startY = event.screenY;
  var leftLim = obj.parent().offset().left;
  var topLim = obj.parent().offset().top;

  obj.on("mousemove", function (event) {
    var newX = event.screenX;
    var newY = event.screenY;

    obj.parent().css("left", leftLim + newX - startX + "px");
    obj.parent().css("top", topLim + newY - startY + "px");
  });

  obj.mouseup(function () {
    obj.off("mousemove");
  });
  obj.mouseout(function () {
    obj.off("mousemove");
  });
}
