//帧缓冲(framebuffer) 指包含显示的所有像素值的数组
//因此通过RFB(远程帧缓冲)构建的是无状态的, 断开或重连不会丢失状态
//但RFB使用TCP作为传输层, 因此需要代理服务器将WebSocket转发为TCP
var websocket = require("./websocket-server");
var net = require("net");

var remotePort = 5900; //vnc server port
var remoteHost = "129.168.56.101"; //vnc server host

websocket.listen(8080, "localhost", function (websocket) {
  //set up backend TCP connection
  var tcpsocket = new net.Socket({ type: "tcp4" });
  tcpsocket.connect(remotePort, remoteHost);

  //TCP handler functions
  tcpsocket.on("connect", function () {
    console.log("Tcp connection open");
  });
  tcpsocket.on("data", function (data) {
    websocket.send(data); //send framebuffer
  });
  tcpsocket.on("error", function () {
    console.log("Tcp connection error", arguments);
  });

  //WebSocket handler functions
  websocket.on("data", function (opcode, data) {
    tcpsocket.write(data);
  });
  websocket.on("close", function (code, reason) {
    console.log("Websocket closed");
    //Close backend connection
    tcpsocket.end();
  });
  console.log("WebSocket connection open");
});

//前端部分作者并没有给全
