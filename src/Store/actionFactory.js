const ACTION_TYPE = "Action"	//定义action的各种type


export const Action1 = (value) => ({
	type: ACTION_TYPE,		//Action的key. 区分不同的Action
	value
})

//在thunk后才能有
export const Ajax = () => {
	return (dispatch)=>{				//异步操作
		//ajax模块: import 'axios'. (得自己下)
    //axios.get('xxx')
    //      .then((resources)=>{
    //      	//依然得走action来操作store
    //      	const data = resources.data
    //      	const acion = Action1(data)
    //      	dispatch(action)
    //      })  //接收成功
    //      .catch(()=>{})  //接收失败
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

//在组件里传入指定的value：
//		const action = Action1(e.target)
