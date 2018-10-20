import { createStore, applyMiddleware } from 'redux'
import reducer from './reducer'

import thunk from 'redux-thunk'
//自己下
//	作用: 对ajax异步请求和组件解耦
//	使用action来控制ajax
import createSagaMiddleware from 'redux-saga'
//也自己下
//	作用: 对ajax异步请求和组件解耦
//	使用迭代器来控制ajax
//	import Msagas from './sagas'
//	const sagaMidd = createSagaMiddleware()
//	applyMiddleware()
//	sagaMidd.run(Msagas)

const store = createStore(
	reducer,
	applyMiddleware(...[thunk])		//使用中间件
);   //创建存储空间

export default store;

/************在组件里
import {Action1} 'actionFactory'
store.getState();   获取数据
    action = Action1();	 绑定事件
store.dispatch(action);   触发事件, 自动发送给store->reducer处理
store.subscribe(func);  订阅Store的变化, 然后 this.setState(store.getState()) 触发render
*/
