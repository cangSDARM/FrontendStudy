const WebSocketServer = require("ws").Server;
const wss = new WebSocketServer({ port: 8888 });
const users = {}; //存储所有连接的用户。测试用

ws.on("connection", function (connection) {
  console.log("User connected");

  connection.on("message", function (meg) {
    console.log("Got message:", meg);
    let data;
    try {
      data = JSON.parse(meg);
    } catch (e) {
      data = {};
    }

    switch (data.type) {
      case "login":
        userLogin(connection, data);
        break;
      case "offer":
        offer$Call(connection, data);
        break;
      case "answer":
        answer$beCall(connection, data);
        break;
      case "candidate":
        candidatee(connection, data);
        break;
      case "leave":
        leave(connection, data);
        break;
      default:
        sendTo(connection, {
          type: "error",
          message: "Unrecognized command:" + data.type,
        });
        break;
    }

    connection.send("Hello world");
  });

  connection.on("close", function () {
    if (connection.name) {
      delete users[connection.name];

      if (connection.otherName) {
        console.log("Disconnecting user from:", connection.otherName);
        let conn = users[connection.otherName];
        conn.otherName = null;

        if (conn != null) {
          sendTo(conn, {
            type: "leave",
          });
        }
      }
    }
  });
});

//1. 需要登陆才能使用WebRTC。
function userLogin(connection, data) {
  console.log("User logged in as", data.name);
  if (users[data.name]) {
    sendTo(connection, {
      type: "login",
      success: false,
    });
  } else {
    users[data.name] = connection;
    connection.name = data.name;
    sendTo(connection, {
      type: "login",
      success: true,
    });
  }
}

//2.（主动）呼叫初始化及offer提供
function offer$Call(connection, data) {
  console.log("sending offer to:", data.name);
  let conn = users[data.name];

  if (conn != null) {
    connection.otherName = data.name;
    sendTo(conn, {
      type: "offer",
      offer: data.offer,
      name: connection.name,
    });
  }
}

//处理ICE候选路径
function candidatee(connection, data) {
  console.log("Sending candidate to:", data.name);

  let conn = users[data.name];
  if (conn != null) {
    sendTo(conn, {
      type: "candidate",
      candidate: data.candidate,
    });
  }
}

//（被动）呼叫应答
function answer$beCall(connection, data) {
  console.log("Sending answer to:", data.name);

  let conn = users[data.name];
  if (conn != null) {
    connection.otherName = data.name;
    sendTo(conn, {
      type: "answer",
      answer: data.answer,
    });
  }
}

function leave(connection, data) {
  console.log("Disconnecting user from:", data.name);

  let conn = users[data.name];
  conn.otherName = null;

  if (conn != null) {
    sendTo(conn, {
      type: "leave",
    });
  }
}

//负责向连接发送消息
function sendTo(conn, meg) {
  conn.send(JSON.stringify(meg));
}
