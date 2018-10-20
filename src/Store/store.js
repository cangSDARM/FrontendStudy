import { createStore, applyMiddleware } from 'redux'
import Reducer from './reducer'
import Thunk from 'redux-thunk'		//自己下

const store = createStore(
	Reducer,
	applyMiddleware([Thunk])		//使用中间件
);   //创建存储空间
export default store;

/************在组件里
import {Action1} 'actionFactory'
store.getState();   获取数据
store.dispatch(action);   触发事件, 自动发送给store->reducer处理
    action = Action1();	 绑定事件
store.subscribe(func);  订阅Store的变化, 然后 this.setState(store.getState()) 触发render
*/
