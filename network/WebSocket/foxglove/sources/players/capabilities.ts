// Capabilities that are not shared by all players.
export const PlayerCapabilities = {
  // Publishing messages. Need to be connected to some sort of live robotics system (e.g. ROS).
  advertise: "advertise",

  // Fetching assets.
  assets: "assets",

  // Calling services
  callServices: "callServices",

  // Setting speed to something that is not real time.
  setSpeed: "setSpeed",

  // Ability to play, pause, and seek in time.
  playbackControl: "playbackControl",

  // List and retrieve values for configuration key/value pairs
  getParameters: "getParameters",

  // Set values for configuration key/value pairs
  setParameters: "setParameters",
} as const;
