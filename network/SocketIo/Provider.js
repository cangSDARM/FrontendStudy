import { EventEmitter } from 'eventemitter3';
import io from 'socket.io-client';

export default class SharedWorkerSocketIO {
  WorkerType = globalThis.Worker || globalThis.SharedWorker;
  /** @type {SharedWorker | Worker} */
  worker = null;
  /** @type {string} */
  workerUri = null;
  /** @type {string} */
  socketUri = null;
  events = new EventEmitter();
  socket = null;
  started = false;
  opts = null;

  constructor(socketUri, opts = {}) {
    this.log('SharedWorkerSocketIO ', socketUri);
    this.socketUri = socketUri;
    this.opts = {
      autoConnect: false,
      reconnection: true, // 是否自动重连
      reconnectionDelay: 500, // 重连间隔时间
      reconnectionAttempts: 1000000000000, // 尝试重连次数
      reconnectionDelayMax: 5000, // 重连间隔时间上限，即最长的重连间隔时间
      transports: ['websocket', 'polling'], // 优先使用WebSocket
      ...opts,
    };
  }

  startSocketIo() {
    this.worker = null; // disable worker
    this.socket = io(this.socketUri, this.opts);
  }

  startWorker() {
    const workerUri = this.getWorkerUri();

    this.log('Starting Worker', this.WorkerType, workerUri);

    this.worker = new this.WorkerType(workerUri, {
      type: 'module',
      name: this.socketUri,
    });

    const port = this.worker.port || this.worker;
    port.onmessage = (event) => {
      this.log('<< io received message', event.data);
      this.events.emit(event.data.type, event.data.message);
    };
    port.onmessageerror = (event) => {
      this.log('<< io worker messageerror', event);
      this.events.emit('error', event);
    };
    port.onerror = (event) => {
      this.log('<< io worker error', event);
      this.events.emit('error', event);
    };
    // connect
    port.postMessage({ connect: true, url: this.socketUri, options: this.opts });
  }

  /**
   * @param {string} event
   * @param {any} data
   * @param {Function} cb
   */
  emit(event, data, cb) {
    if (!this.started) this.start();

    this.log('|| io emit:', event, data, cb);
    if (this.worker) {
      const ack = 'ack:';
      const port = this.worker.port || this.worker;
      port.postMessage({
        eventType: 'emit',
        event: event,
        data: data,
        ack,
      });
      this.events.on(ack + event, cb);
    } else {
      this.socket.emit(event, data, cb);
    }
  }

  /**
   * @param {string} event
   * @param {Function} cb
   */
  on(event, cb) {
    if (!this.started) this.start();

    this.log('|| io on:', event);
    if (this.worker) {
      const port = this.worker.port || this.worker;
      port.postMessage({
        eventType: 'on',
        event: event,
      });
      this.events.on(event, cb);
    } else {
      this.socket.on(event, cb);
    }
  }

  start() {
    if (this.started) return;
    this.started = true;
    try {
      this.log('Attempting to start socket.io shared webworker');
      this.startWorker();
    } catch (e) {
      this.log('Starting socket.io instead');
      this.startSocketIo();
    }
  }

  setWorkerType(WorkerType) {
    this.log('Setting WorkerType', WorkerType);
    this.WorkerType = WorkerType;
  }

  /**
   * @returns {string | URL}
   */
  getWorkerUri() {
    return this.workerUri || new URL('./worker.js', import.meta.url);
  }
}

SharedWorkerSocketIO.prototype.log = console.log.bind(console);
