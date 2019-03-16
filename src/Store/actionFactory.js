const ACTION_TYPE = "Action"	//定义action的各种type

export const Action1 = (value, key) => ({
	type: ACTION_TYPE,		//Action的key. 区分不同的Action
	value,
	key	//可以有多个值. 不是一个Action只能变动一个value
});

//在thunk后才能有
export const Ajax = (value, key) => {
	return async (dispatch)=>{
		//异步操作
    	//thunk 需要内部自己 dispatch,
    	//但调用时仍然使用: store.dispatch(Ajax)
    	dispatch({
    		type: ACTION_TYPE,
    		value,
    		key
    	})
	}
}
//举例:
//调用: store.dispatch(Axios).then(xx).catch(xx)
//	实际上store只能接受一个对象，
// 	但这时store会自动执行下这个action函数，
export const Axios = () =>{
	return async (dispatch)=>{
		const promise = new Promise((resolve, reject)=>{
			const doRequest = axios.get();
			doRequest.then(
				res => {
					dispatch({
						type: ACTION_TYPE,
						value: res.data,
					})
					resolve(res);
				},
				err => {
					dispatch({
						type: ACTION_TYPE,
						value: err,
					})
					reject(err);
				}
			)
		})
		return promise;
	}
}

//在saga后才能有
improt { put, takeEvery } from 'redux-saga/effects'
//function* 表示迭代器
function* CallBack(){
	//try{
	//	const res = yield axios.get('xxx')
	//	const action = Action1(res.data)
	//	yiled put(action)
	//}catch(e){
	//	console.error(e)
	//}
}
function* Msags(){
	yield takeEvery("Action1Type", CallBack)	//获取到type为Action1Type的action
}
export default Msags;

//ajax模块: (得自己下)
import 'axios'
//	前端模拟时: 用 Mock 或者 public/api/list.json
//axios.get('/api/list.json')
//      .then((resources)=>{
//      	//依然得走action来操作store
//      	const data = resources.data
//      	const acion = Action1(data)
//      	dispatch(action)
//      })  //接收成功
//      .catch(()=>{})  //接收失败