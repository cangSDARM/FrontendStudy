## usage

```jsx
<WebRTCPeerProvider onIceSelect={() => fetch('/api/ice')}>
  <WebRTCConnProvider id="room1">
    {() => {
      const conn = useWebRTCConn("room1");

      React.useEffect(() => {
        conn.on("data", console.log);
      }, [conn]);

      return <></>;
    }}
  </WebRTCConnProvider>

  <WebRTCConnProvider id="room2">
    {() => {
      const conn = useWebRTCConn("room2");

      React.useEffect(() => {
        conn.on("data", console.log);
      }, [conn]);

      return <></>;
    }}
  </WebRTCConnProvider>

  <>
    {() => {
      const peer = useWebRTCPeer();
      const context = getConnContext(peer, "room3");
      const conn = React.useRef();

      React.useEffect(() => {
        conn.current = peer.peer.connect("room3", { reliable: true });
        console.log(conn); // room3 connection
      }, [conn]);

      return <context.Provider value={{ conn: conn.current, connected: true }}></context.Provider>;
    }}
  </>
</WebRTCPeerProvider>
```
