## Get Start

**You need install React to use this package**

```jsx
import React from "react";
import { FoxgloveSocketProvider, FoxgloveContext } from "@";
import { toast, Button } from "antd";

const Connect = () => {
  const playerSelections = usePlayerSelection();
  const wsUrl = "ws://localhost:8081";

  return (
    <>
      <Button
        onClick={() => {
          const availableSource = playerSelections.availableSources[0];
          playerSelections.active(availableSource.id, {
            type: "connection",
            params: {
              url: wsUrl,
            },
          });
        }}
      >
        打开连接
      </Button>
      <Button
        onClick={() => {
          const availableSource = playerSelections.availableSources[0];
          playerSelections.disable(availableSource.id);
        }}
      >
        关闭连接
      </Button>
    </>
  );
};

const Display = () => {
  const panelID = "display-panel";
  const [topics, setTopics] = React.useState([]);
  const [jsonData, setJsonData] = React.useState(undefined);

  React.useEffect(() => {
    FoxgloveContext.sub.topicsSync(sortedTopics => {
      // console.log("Topic", state);
      setTopics(sortedTopics);
    });
  }, []);

  React.useEffect(() => {
    const subscribeByIdDebounced = FoxgloveContext.sub.messagesByIdSync(panelId, messages => {
      // console.log("Json", messages);
      if (!messages) {
        return;
      }
      setJsonData(messages[0].message);
    });

    return () => {
      subscribeByIdDebounced();
    };
  }, []);

  return (
    <React.Fragment>
      <Button
        onClick={() => {
          FoxgloveContext.sub.update({
            id: panelId,
            payloads: [{ topic: "xxx" }],
          });
        }}
      >
        订阅消息
      </Button>
      <Button
        onClick={() => {
          FoxgloveContext.sub.update({
            id: panelId,
            payloads: [{ topic: "xxx" }],
          });
        }}
      >
        取消订阅
      </Button>
      <Button
        onClick={() => {
          FoxgloveContext.sub.cleanById(panelId);
        }}
      >
        取消订阅全部
      </Button>
      {JSON.stringify(jsonData)}
    </React.Fragment>
  );
};

const Publish = () => {
  const [publisher, setPublisher] = React.useState({ canPublish: false });

  return (
    <>
      <Button
        onClick={() => {
          const result = FoxgloveContext.pub.register({ topic: "example", schemaName: "exampleSchema" });

          if (result.canPublish) {
            setPublisher(result);
          }
        }}
        disable={publisher.canPublish}
      >
        注册发布者
      </Button>
      <Button
        onClick={() => {
          publisher.publish({ topic: "example", msg: { a: 1, b: 2 } });
        }}
        disable={!publisher.canPublish}
      >
        发布
      </Button>
      <Button
        onClick={() => {
          publisher.cleanup();
          setPublisher({ canPublish: false });
        }}
        disable={!publisher.canPublish}
      >
        停止发布
      </Button>
    </>
  );
};

const Converter = () => {
  const subConverter = {
    name: "sub",
    fromSchemaName: "schema",
    toSchemaName: "anotherSchema",
    converter: (msg, evt) => {
      return 2;
    },
  };

  const pubConverter = {
    name: "pub",
    topic: "topic",
    converter: (msg, evt) => {
      return 2;
    },
  };

  return (
    <>
      <Button
        onClick={() => {
          // Automatic conversion after setting
          FoxgloveContext.convert.set(subConverter);
        }}
      >
        add subscribe converter
      </Button>
      <Button
        onClick={() => {
          // Automatic conversion after setting
          FoxgloveContext.convert.set(pubConverter);
        }}
      >
        add publish converter
      </Button>
      <Button
        onClick={() => {
          FoxgloveContext.convert.clean(subConverter.fromSchemaName);
          FoxgloveContext.convert.clean(pubConverter.topic);
        }}
      >
        remove converter
      </Button>
    </>
  );
};

const App = () => {
  return (
    <FoxgloveSocketProvider toast={toast}>
      <Connect />
      <Display />
      <Publish />
      <Converter />
    </FoxgloveSocketProvider>
  );
};
```
