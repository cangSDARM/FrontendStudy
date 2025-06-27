并不是 websocket 实现库，而是包括 http pull downgrade + websocket sub protocol 的
因此 SocketIo 和 websocket 并不完全兼容

```js
const socketIo = new SocketIoProvider('ws://' + import.meta.env['SERVER_IP_PORT']);

export const emitSocketData =  async (data) => {
  const composed = {
    ...data
  };

  const ack = await new Promise((res) => {
    socketIo.emit('sent', composed, res);
  });

  console.log(ack);

  return ack;
};

export const initSocketIo = async () => {
  socketIo.start();

  socketIo.on('connect_ack', console.log);
  socketIo.on('connect_error', console.warn);
  socketIo.on('disconnect', (Reason) => {
    if (Reason === 'transport close')
      console.log('断开链接：连接被关闭(例如:用户失去连接，或者网络由WiFi切换到4G)');
    else if (Reason === 'io server disconnect')
      console.log('断开链接：服务器使用socket.disconnect()强制断开了套接字。');
    else if (Reason === 'io client disconnect')
      console.log('断开链接：使用socket.disconnect()手动断开socket。');
    else if (Reason === 'ping timeout')
      console.log('断开链接：服务器没有在pingInterval + pingTimeout范围内发送PING');
    else if (Reason === 'transport error')
      console.log('断开链接：连接遇到错误(例如:服务器在HTTP长轮询周期期间被杀死)');
    else console.log('断开链接：', Reason);
  });
};
```
