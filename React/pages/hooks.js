//react-hooks 是基于函数式编程的思想, 使得"无状态"组件可以增加状态.
//而且可以很好的自定义hook, 来达到减少包装层的目的
//很明显, 不能在class里使用hook
//
//tips:
//	同一hook函数可以在一个函数里使用多次
//	只能在函数最高层作用域调用hook, 不能在循环/判断/子函数里使用
//^16.8.0

import React, {useState, useEffect, useContext, useReducer, useCallback} from 'react';

const App = (props) => {
	//hooks.
	//	需要状态的初始值(没有的置undefined), 可以是个返回初始值的函数
	//	在初次渲染时被调用(only once)
	//	读取值: count, 设定值: setCount
	const [count, setCount] = useState(0);
	//两种调用
	//	setCount(1);	//newValue
	//	setCount(pre => pre + 1);	//function
	//但不会自动合并状态, 需要自己手动合并: setCount(pre=>({...pre, ...new}))

	//hooks.
	//	默认等效于: componentDidMount + componentDidUpdate
	//	按照声明顺序调用effect
	//	内部调用顺序: 清除当前effect, 运行下一个effect
	//	异步. 在DOM更新时会延时执行, 而不妨碍视图效果(同步参考useLayoutEffect)
	useEffect(()=>{
		document.title = 'title';

		return ()=>{
			console.log("清除当前effect");
		}
	}, [count]);	//仅在count变化时更新; 若传递空数组则仅在组件挂载和卸载时执行effect, 而不是每次渲染; 不传表示每次DidUpdate都调用

	//hooks.
	//	接收一个Context对象(React.createContext的返回值),
	//	返回当前context的值.
	//	类似于: static contextType = MyContext
	//使用前请参阅官方文档
	const value = useContext(MyContext);

	//hooks.
	//	类似于redux逻辑的react lite版本.
	//使用前请参考官方文档
	const [state, dispatch] = useReducer(reducer, init);

	//hooks.
	//	返回function的memoized版本(将上次的计算结果缓存起来, 若遇到相同参数则返回缓存中的数据)
	//	[a, b, c]表示仅在a/b/c变化时才会更新
	const memoizedCallback = useCallback(function, [a,b,c]);

	//hooks.
	//	返回memoized值
	//	在每次渲染时运行. 适合做大量的运算
	const memoizedValue = useMemo(()=>{}, [a,b,c]);

	//hooks.
	//	返回可变的ref对象, 其.current是其对应dom节点
	//	ref变化时, useRef不会重新调用. 若变更.current也不会导致重新渲染(使用useCallback来实现)
	//	其实可以包裹任何元素. 可以当做一个实例变量来使用它
	const ref = useRef(null);

	//hooks.
	//	使用这个来使得父组件可以调用ref的相关内容
	//	需要结合forwardRef
	//使用前请参考官方文档
	useImperativeHandle(ref, ()=>({}), [deps]);

	//hooks.
	//	同useEffect相同的api. 是和浏览器的同步版本(每次DOM布局改变则立刻调用)
	useLayoutEffect();

	//hooks.
	//	在DevTools上显示信息
	useDebugValue('info', info=>info.toString());

	return (
		<div>
			React-Hooks
		</div>
	)
}

//自定义hook
//	必须以 use 开头(保证hook的正确使用和声明)
//	可以内嵌任意hook
//	返回值和参数都随意
//使用相同的hook不会共享state
//每次使用的hook内部state都是不同的
function useList(arguments){
	return xxx;
}
