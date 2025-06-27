'use strict';
import io from 'socket.io-client';

class SocketIoWorkerHandler {
  constructor() {}

  /** @type {Socket} */
  socket = null;
  /** @type {MessagePort[]} */
  ports = [];
  socketConnected = false;

  /**
   * @param {MessageEvent} event 
   */
  onPortConnect = (event) => {
    const port = event.ports[0];
    this.ports.push(port);
    port.start();

    console.debug('client connected to shared worker', event);

    port.addEventListener('message', (event) => this.handleMessage(event, port));
  };

  /**
   * @param {MessageEvent} event 
   */
  broadcast = (event, message) => {
    this.ports.forEach(function (port) {
      port.postMessage({
        type: event,
        message: message,
      });
    });
  };

  handleConnect = ({ url, options }) => {
    this.socket = io(url, options);
    // handle shared webworker clients already with ports
    this.socket.on('connect', (msg) => {
      this.socketConnected = true;
      this.broadcast('connect', msg);
    });
    this.socket.on('disconnect', (msg) => {
      this.socketConnected = false;
      this.broadcast('disconnect', msg);
    });
    this.socket.on('connect_error', (msg) => {
      this.socketConnected = false;
      this.broadcast('connect_error', msg);
    });
    this.socket.connect();
  };

  handleListener = (event, port, { eventName }) => {
    if (eventName == 'connect') {
      if (socketConnected) {
        port.postMessage({
          type: eventName,
        });
      }
      return;
    }
    if (eventName == 'disconnect') {
      return;
    }

    this.socket.on(eventName, (msg) => {
      console.debug('socket received message', msg);
      port.postMessage({
        type: eventName,
        message: msg,
      });
    });
  };

  handleEmit = (e, port, { ack, event, data }) => {
    this.socket.emit(event, data, (resp) => {
      port.postMessage({
        type: ack + event,
        message: resp,
      });
    });
  };

  /**
   * @param {MessageEvent} event
   * @param {MessagePort} port
   */
  handleMessage = (event, port) => {
    const model = event.data;
    console.log('>> port received message from main thread', model);
    if (model.connect) {
      this.handleConnect(model);
      return;
    }

    switch (model.eventType) {
      case 'on':
        const eventName = model.event;
        this.handleListener(event, port, { eventName });
        break;
      case 'emit':
        this.handleEmit(event, port, model);
        break;
      default:
        console.error('unhandled eventType', model.eventType);
    }
  };
}

const main = () => {
  const handler = new SocketIoWorkerHandler();

  // shared worker handle new clients
  addEventListener('connect', handler.onPortConnect);

  // TODO: support SharedWorker
  // regular worker handle messages
  addEventListener('message', (event) => handler.handleMessage(event, self));
  // if (typeof Worker !== 'undefined') {
  //   setTimeout(() =>
  //     postMessage({
  //       type: 'connect',
  //       message: null,
  //     }),
  //   );
  // }
};

if (typeof window === 'object') {
  window.SocketIoSharedWorker = main;
}

if (typeof module === 'object') {
  module.exports = main;
} else {
  main();
}
