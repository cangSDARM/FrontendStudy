import React from "react";
import { getSocketContext } from "./context";

export const useSocket = () => {
  return React.useContext(getSocketContext("default"));
};
