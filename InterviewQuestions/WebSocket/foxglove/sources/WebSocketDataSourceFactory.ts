import { IDataSourceFactory, DataSourceFactoryInitializeArgs } from "@/react/PlayerSelectionContext";
import GvizWebSocketPlayer from "@/sources/players/WebSocketPlayer";
import { Player } from "@/sources/players/types";

export default class GvizWebSocketDataSourceFactory implements IDataSourceFactory {
  public protocol: IDataSourceFactory["protocol"] = "websocket";
  public id = "gviz-websocket";
  public type: IDataSourceFactory["type"] = "remote";
  public displayName = "Gviz WebSocket";
  public iconName: IDataSourceFactory["iconName"] = "Flow";
  public description =
    "Connect to a ROS 2, or custom system using the Gviz WebSocket protocol. For ROS systems, be sure to first install the foxglove_bridge ROS package.";
  public docsLinks = [
    {
      label: "ROS 2",
      url: "https://docs.foxglove.dev/docs/connecting-to-data/frameworks/ros2#foxglove-websocket",
    },
    {
      label: "custom data",
      url: "https://docs.foxglove.dev/docs/connecting-to-data/frameworks/custom#foxglove-websocket",
    },
  ];

  public formConfig = {
    fields: [
      {
        id: "url",
        label: "WebSocket URL",
        defaultValue: "ws://localhost:8765",
        validate: (newValue: string): Error | undefined => {
          try {
            const url = new URL(newValue);
            if (url.protocol !== "ws:" && url.protocol !== "wss:") {
              return new Error(`Invalid protocol: ${url.protocol}`);
            }
            return undefined;
          } catch (err) {
            return new Error("Enter a valid url");
          }
        },
      },
    ],
  };

  public initialize(args: DataSourceFactoryInitializeArgs): Player | undefined {
    const url = args.params?.url;
    if (!url) {
      throw Error("require a params.url in args!", { cause: args });
    }

    return new GvizWebSocketPlayer({
      url,
      sourceId: this.id,
    });
  }
}
