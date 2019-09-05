window.onload = function() {
            if (window.applicationCache) {
                alert("IE无法加载广告，请直接访问：http://www.miskatonic-university.org");
            } else {
                alert("你的浏览器不支持HTML5，无法显示广告！广告是我们发展的动力，请下载支持HTML5的浏览器！");
            }
        }
function initEcAd() {
document.all.AdLayer1.style.posTop = -200;
document.all.AdLayer1.style.visibility = 'visible'
document.all.AdLayer2.style.posTop = -200;
document.all.AdLayer2.style.visibility = 'visible'
MoveLeftLayer('AdLayer1');
}

function MoveLeftLayer(layerName) {
var x = 100;
var y = 400;// 左侧广告距离页首高度
var diff = (document.body.scrollTop + y - document.all.AdLayer1.style.posTop)*.40;
var y = document.body.scrollTop + y - diff;
eval("document.all." + layerName + ".style.posTop = parseInt(y)");
eval("document.all." + layerName + ".style.posLeft = x");
setTimeout("MoveLeftLayer('AdLayer1');", 20);
}
function closed()
{
 var aaa=document.getElementById("AdLayer1");
 aaa.style.display="none"
}
document.write("<div id=AdLayer1 style='position: absolute;visibility:hidden;z-index:1;display:'><a href='http://www.miskatonic-university.org' target='_blank'><img src=rec/img/03.jpg border='0'></a><img src='rec/img/5-140FG95150.gif'  onclick='closed();'/></div>");
initEcAd()

// JavaScript Document