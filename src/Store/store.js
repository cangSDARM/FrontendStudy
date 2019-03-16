import { createStore, applyMiddleware, compose } from 'redux'
import reducer from './reducer'

import thunk from 'redux-thunk'
//自己下
//	使用action来控制ajax
//参看actionFactory.js
import createSagaMiddleware from 'redux-saga'
//也自己下
//	使用迭代器来控制ajax
//参看actionFactory.js
//		它的中间件调入:
//			import Msagas from './sagas'
//			const sagaMidd = createSagaMiddleware()
//			applyMiddleware()
//			sagaMidd.run(Msagas)

//中间件: dispatch -> 中间件 -> Reducer -> State -> Component

//使用Redux-Dev-Tools
const composeEnhancers =
  typeof window === 'object' &&
  	window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;
	//compose函数需要从redux中引出来

const enhancer = composeEnhancers(
  applyMiddleware(thunk),			//使用中间件
  // other store enhancers if any
);
const store = createStore(
	reducer,
	enhancer 	//不使用RDT时, 直接applyMiddleware([thunk])
);   //创建存储空间

export default store;

/************在组件里
import {Action1} 'actionFactory'
1. store.getState();   获取数据
通常不用:
2. action = Action1();	 绑定事件
3. store.dispatch(action);   触发事件, 自动发送给store->reducer处理
4. store.subscribe(func);  订阅Store的变化, 然后 this.setState(store.getState()) 触发render
用这个代替:
参看reducer.js
*/
