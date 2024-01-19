- [Multiplexing](#multiplexing)
  - [select](#select)
  - [poll](#poll)
  - [epoll](#epoll)
  - [kqueue](#kqueue)
- [Inter-Process Communication(IPC)](#inter-process-communicationipc)
  - [Signal](#signal)
  - [Anonymous Pipes](#anonymous-pipes)
  - [Named Pipes (FIFO File)](#named-pipes-fifo-file)
  - [Unix Domain Sockets](#unix-domain-sockets)
  - [Unix Message Queue](#unix-message-queue)
  - [Shared Memory](#shared-memory)
  - [Memory-Mapped Files](#memory-mapped-files)
  - [eventfd](#eventfd)
  - [NT Mailslot](#nt-mailslot)
  - [NT DDE](#nt-dde)
  - [NT Local Procedure Call](#nt-local-procedure-call)
  - [NT RPC](#nt-rpc)
  - [Node 相关](#node-相关)

## Multiplexing

### select

```cpp
int select (int n, fd_set *readfds, fd_set *writefds, fd_set *exceptfds, struct timeval *timeout);

if (select(mfd, &rset, 0, 0, &timeout) < 0) {
  perror("select");
}
```

内部:

- 中断当前进程，陷入内核进程
- 内核轮询从 0 到 "mfd" - 1 的所有 fd
  - 用户态没法轮询哪个 fd 可用
  - 由于安全及性能考虑，最大 "mfd" 为 1024
- 如果有 event 发生，设置对应的 "set" 比特位，返回
- 否则中断直到 "timeout" 配置

### poll

是对 select 的优化

```cpp
int poll (struct pollfd *fds, unsigned int nfds, int timeout);

int nfds = 1;
struct pollfd *pfds;
pfds = calloc(nfds, sizeof(struct pollfd));
if (poll(pfds, nfds, -1)) {
  if (pfds[0].revents & POLLIN) {
    // handle first pfds
  }
}
```

内部:

- 中断当前进程，陷入内核进程
- 内核轮询 "pfds" 中的所有 fd
  - 用户态没法轮询哪个 fd 可用
  - 没有最大限制，只依赖于 "nfds" 设置
- 如果有期望的 "pfds\[i].events" 发生，设置对应的 "pfds\[i].revents" 比特位，返回
- 否则中断直到 "timeout" 毫秒

### epoll

是对 poll 的优化

```cpp
int epoll_create(int size);
int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);
int epoll_wait(int epfd, struct epoll_event * events, int maxevents, int timeout);

int fd1 = 667, fd2 = 666;
struct epoll_event event;
event.events = EPOLLIN;
event.data.fd = fd1;

// create a context(a map to all needed fds/events. aka fd in unix world)
int epoll_fd = epoll_create1(2);

// Prepare all fd and related event
epoll_ctl(epoll_fd, EPOLL_CTL_ADD, fd1, &event);
epoll_ctl(epoll_fd, EPOLL_CTL_ADD, fd2, &event);

// epoll working
int event_count = epoll_wait(epoll_fd, events, MAX_EVENTS, -1);
for(i = 0; i < event_count; i++) {
    printf("Reading file descriptor '%d' -- ", events[i].data.fd);
}
close(epoll_fd);    // close context
```

内部:

- 中断当前进程，陷入内核进程
- 内核直接注册 "epoll_fd" 到事件发生的 "fd"
  - 用户态没法注册
  - 没有最大限制，只依赖于 os 的 fd 数量限制
- "fd" 触发事件后，跟着会触发到 "epoll_fd" 对应 "fd" 的 "event"
- 触发后，设置对应的 "event.events" 比特位，返回
- 否则中断直到 "timeout" 毫秒

### kqueue

kqueue 和 epoll 类似，但是抽象更为完善，允许非 fd 类型的数据被监听，代价是写法更复杂

## Inter-Process Communication(IPC)

### Signal

消息接收方不用检测消息是否可用、消息格式等。只需要注册对应的系统中断信号、触发即可

- 由于是重写对应的系统信号，因此要注意必须是 async-safe 的
- 需要接收方重写并注册对应信号的处理方法，且双方在同一个进程组
- 是单工通信

```python
import os
import signal

def end(signum, frame):
  global should_end
  os.write(1, b"End\n")
  should_end = True

def print_ping(signum, frame):
  os.write(1, b"Server: ping\n")
  os.kill(0, signal.SIGUSR1)

def reader():
  signal.signal(signal.SIGUSR2, handler=print_ping)
  signal.signal(signal.SIGQUIT, end)

  while not should_end:
    pass

i = 0
ROUNDS = 100

def print_pong(signum, frame):
    global i
    os.write(1, b"Client: pong\n")
    i += 1

def writer():
  signal.signal(signal.SIGUSR1, print_pong)
  while i < ROUNDS:
    os.kill(0, signal.SIGUSR2)
  os.kill(0, signal.SIGQUIT)
```

### Anonymous Pipes

进程通过一个特殊的 buffer 进行通讯。

- 只允许父子进程进行通讯
- 单工通讯。数据读取后不会保留

```bash
ls -hl | grep -e 'name'
# the '|' is a pipe
# shell and it's children processes (ls, grep) can communicate with the pipe
```

### Named Pipes (FIFO File)

进程通过特殊文件(FIFO File)进行通讯。因为是文件所以有读写权限管理、监听清除等功能

- 只是一个进程间共享的 buffer，以文件形式管理。所以数据只存在内存中
- 除非有读取，否则不会写进 buffer。但数据读取后不会保留
- 全双工。但内部不会区分谁是谁，因此区分消息的来源需要更上层的协议支持
- 是否发了信息，是否需要收信息等同步问题需要外部处理
- (Windows only) 是半双工的，读写无法同时进行。但允许远程网络进程通讯

```python
import os

ROUNDS = 100
pipe_path = '/tmp/ping'

def reader():
  fd = os.open(pipe_path, os.O_WRONLY)
  i = 0
  while i != ROUNDS:
    os.write(fd, b'ping')
    print("Client: Sent ping")
    i += 1
  os.write(fd, b'end')
  os.close(fd)

def writer():
  os.mkfifo(pipe_path) # trick here
  fd = os.open(pipe_path, os.O_RDONLY)
  data = os.read(fd, 4).decode()
  while data != 'end':
    print(f"Received {data}")
    data = os.read(fd, 4).decode()
  os.close(fd)
  os.unlink(pipe_path)
```

### Unix Domain Sockets

是网络通信(socket)衍生过来的技巧。也是基于 unix 的文件系统进行进程间通讯

- 因为衍生自网络技巧，因此支持流式数据(Stream Socket)或分包数据(Datagram Socket)
- 基于 Socket，因此通信双方都有自己的 ReadBuffer 和 WriteBuffer。数据是由拷贝发送
- 全双工。拥有全套的消息拥塞处理、连接保持、并发机制
- 每次建立通讯都是新加一个 Socket 因此不会有区分问题
- 虽然说是"Unix"，但 windows 有与之对应的[Winsock](https://learn.microsoft.com/zh-cn/windows/win32/winsock/windows-sockets-start-page-2)实现

```python
import socket
import os

server_address = './udsocket'

def client():
  sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
  sock.connect(server_address)

  print(f"Connecting to {server_address}")
  i = 0
  msg = "ping".encode()
  while i < 50:
    sock.sendall(msg)
    print("Client: Sent ping")

    data = sock.recv(16)
    print(f"Client: Received {data.decode()}")
    i += 1
  sock.sendall("end".encode())
  sock.close()

def server():
  # Delete if the path does exist
  try:
    os.unlink(server_path)
  except OSError:
    pass

  server = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
  server.bind(server_path)

  server.listen(1)
  msg = "pong".encode()
  while True:
    connection, address = server.accept()
    print(f"Connection from {address}")
    while True:
      data = connection.recv(16).decode()
      if data != "ping":
        break
      print(f"Server: Received {data}")
      connection.sendall(msg)
    if data == "end":
      connection.close()
    else:
      print(f"Server Error: received invalid message {data}, shutting down connection")
      connection.close()
```

### Unix Message Queue

- 是面向记录的，其中的消息具有特定的格式以及特定的优先级
- 独立于发送与接收进程。进程终止时，消息队列及其内容并不会被删除。
- 进程通过特殊的 key 寻找自己需要的 MQ
- 可以实现消息的随机查询。消息不一定要以 FIFO 的次序读取，也可以按消息的类型读取

```python
import os
import sysv_ipc

ROUNDS = 100
path = '/tmp/example'

def client():
  fd = os.open(path, flags=os.O_CREAT)
  os.close(fd)
  key = sysv_ipc.ftok(path, 42)
  mq = sysv_ipc.MessageQueue(key, flags=sysv_ipc.IPC_CREAT, mode=0o644)
  msg_type = 10
  i = 0
  while i != ROUNDS:
    mq.send(b"ping", type=msg_type)
    data, _ = mq.receive(type=(msg_type+1))
    data = data.decode()
    print(f"Client: Received {data}")
    i += 1
  mq.send(b"end", type=msg_type)

def server():
  fd = os.open(path, flags=os.O_CREAT) # create file
  os.close(fd)
  key = sysv_ipc.ftok(path, 42)
  mq = sysv_ipc.MessageQueue(key, flags=sysv_ipc.IPC_CREAT, mode=0o644)
  msg_type = 10
  data, _ = mq.receive(type=msg_type)
  data = data.decode()
  while data != 'end':
    print(f"Server: Received {data}")
    mq.send(b"pong", type=(msg_type+1))
    data, _ = mq.receive(type=msg_type)
    data = data.decode()
  os.unlink(path)
  mq.remove()
```

### Shared Memory

https://goodyduru.github.io/os/2023/10/05/ipc-unix-signals.html

https://www.testerfans.com/categories/linux

https://learn.microsoft.com/zh-cn/windows/win32/ipc/interprocess-communications

### Memory-Mapped Files

### eventfd

### NT Mailslot

- 古早技术，早已被淘汰
- 不局限于本机进程间通信，可以跨设备
- 使用无需确认的报文在网络上传输，因此不可靠，可能丢失
- 可以广播，但同个设备只能有一个进程监听
- 仅可传递短消息，单消息最大上限为 400 字节

### NT DDE

- 巨硬特有的技术，早已被淘汰。但某些上古软件可能还在用，如 Office 360
- 传承自利用剪贴板当 IPC，巨硬规范了一下。

### NT Local Procedure Call

https://cloud.tencent.com/developer/article/1858934

### NT RPC

### Node 相关

|      IPC 方法      | 支持情况 |                   备注                    |
| :----------------: | :------: | :---------------------------------------: |
|       Signal       |   支持   | 使用`process.once('SIGINT', (sig) => {})` |
|  Anonymous Pipes   |  可模拟  |   使用 `child-process` 及 `event` 模拟    |
|     Named Pipe     |  不支持  |                    \/                     |
| Unix Domain Socket |   支持   |     `server.listen('/tmp/test.sock')`     |
| Unix Message Queue |  不支持  |        使用第三方库，如`node-svmq`        |
|    NT Mailslot     |  不支持  |        使用第三方库，如`mailslot`         |
|       NT DDE       |  不支持  |         使用第三方库，如`ts-dde`          |
