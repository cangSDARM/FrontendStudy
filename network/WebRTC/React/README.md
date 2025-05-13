## usage

```jsx
<RTCPeerProvider onIceSelect={() => fetch('/api/ice')}>
  <RTCConnProvider id="room1">
    {() => {
      const conn = useWebRTCConn("room1");

      React.useEffect(() => {
        conn.on("data", console.log);
      }, [conn]);

      return <></>;
    }}
  </RTCConnProvider>

  <RTCConnProvider id="room2">
    {() => {
      const conn = useWebRTCConn("room2");

      React.useEffect(() => {
        conn.on("data", console.log);
      }, [conn]);

      return <></>;
    }}
  </RTCConnProvider>

  <>
    {() => {
      const peer = useWebRTCPeer();
      const conn = React.useRef();

      React.useEffect(() => {
        conn.current = peer.peer.connect("room3", { reliable: true });
        console.log(conn); // room3 connection
      }, [conn]);

      return <></>;
    }}
  </>
</RTCPeerProvider>
```
