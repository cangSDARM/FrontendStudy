const ACTION_TYPE = "Action"	//定义action的各种type


export const Action1 = (value) => ({
	type: ACTION_TYPE,		//Action的key. 区分不同的Action
	value
})

//在组件里传入指定的value：
//		const action = Action1(e.target)