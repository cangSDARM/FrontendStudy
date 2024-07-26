import { AppRegistry } from 'react-native'
import App from './App'

AppRegistry.registerComponent('项目名', ()=>App);

//后台任务
AppRegistry.registerHeadlessTask("SomeTaskName", () => require("SomeTaskName"));

module.exports = async taskData => {
  // 要做的任务
};