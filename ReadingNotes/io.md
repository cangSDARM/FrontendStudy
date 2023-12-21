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
- "fd" 触发事件后，跟着会触发到 "epoll_fd" 对应的 "event"
- 触发后，设置对应的 "event.events" 比特位，返回
- 否则中断直到 "timeout" 毫秒

### kqueue

kqueue 和 epoll 类似，但是抽象更为完善，允许非 fd 类型的数据被监听。但写法更复杂

## Inter-Process Communication(IPC)

https://goodyduru.github.io/os/2023/09/26/ipc-named-pipes.html

## Named Pipes

## Unix Domain Sockets

## Unix Signals

## Message Queues

## Shared Memory

## Memory-Mapped Files

## eventfd
