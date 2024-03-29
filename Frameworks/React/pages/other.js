import React from 'react';

//************************************ES7 property initializers
// 同ES6的PropTypes, State 初始化，但更为直观
//		ES6版:
//属性强校验
import PropTypes from 'prop-types'
class Index extends Component{
	constructor(props){
		this.state = {
			def: true,
		}
	}
}
Index.propTypes = {
  //对相关类型进行强制校验, 防止父组件传递无效信息
  text: PropTypes.string.isRequired,    //isRequired: 必须传
  content: PropTypes.string,    //支持类型: array, func, number, bool, object, symbol, string, node, element,
  func: PropTypes.instanceOf(CLS) //支持实例检测
  option: PropTypes.oneOf(['1','2'])  //支持选择
  //更多: htmls://reactjs.org/docs/typechecking-with-proptypes.html
}
Index.defaultProps = {
  //设定默认值(没传给子组件时)
  text: 'Hello World'
}
//****************************************************************
//		ES7版:
import PropTypes from 'prop-types'
class Index extends Component{
	static propTypes = {
		text: PropTypes.string.isRequired,
	};	//分号是必要的
	static defaultProps = {
		text: "hello World"
	};
	state = {
		dep: true,
	}
	constructor(props){ super(props); }
}
//****************************************************************

//************************************函数作为子组件
// 同样类似于python的装饰器.
// 		只是和高阶函数不同, 函数作为子组件是由外部使用决定
const Func = (props)=>(		//定义
	<div>
		{props.children('New')}
	</div>
)
const Index = <Func>		{/*使用*/}
	{(name)=>{
		<div>{name}</div>
	}}
</Func>
//****************************************************************

//*************************************Context
// 另一Context实现参考index.js
// 这一种是组件包裹
// 		是函数作为子组件的React官方实现
const Context = React.createContext('light');	//定义. 参数:object
const Index = <Context.Provider value="dark">	{/*使用. 则子组件能拿到这个value*/}
	<Button />
</Context.Provider>
const Button = (props)=>(
	<Context.Consumer>
		{value => <button {...props} theme={value}/>}
	</Context.Consumer>
)
//****************************************************************

//*************************************按需加载
import { lazy, Suspense } from 'react';

//需要加载的组件
const PageLoad = lazy(() => import('./Index'));
//加载时显示的信息
<Suspense fallback={<div>loading</div>}>
	<PageLoad />
</Suspense>

//****************************************************************

//*************************************React Portals
// >=16.3
// 将虚拟DOM映射到任何真实DOM节点
// 解决了漂浮层问题
// 除了渲染位置不同外, 和其它组件相同
ReactDOM.createPortal(
	this.Dialog(),		//虚拟节点
	document.getElementById("Dialog-Warper"),	//真实存在的DOM节点. 不能是React渲染出来的虚拟节点
)
//****************************************************************

//*************************************React Error Boundaries
// >=16.x
// 通过一个生命周期方法捕获子组件的所有异常
// 只能捕获子组件的异常，而不能捕获自身出现的异常
// 只能以class组件的形式定义
// 只能捕获Render和生命周期方法中出现的异常
class ErrorBoundary extends React.Component {
	componentDidCatch(error, info){
		*@param error: 被抛出的异常
		*@param info: 包含异常堆栈列表的对象
		console.error({error: info})
	}
	render() {
		// 不干扰子组件结构
		return this.props.children;
	}
}
//****************************************************************

//**************************************React.memo
//^16.6.0
// 类似于class形式的PureComponent, 内部实现了浅比较来优化function组件
// 一个高阶组件
const Comp = React.memo(function MyMemoComp(props){
	/*only rerenders if props change*/
}, customMemoFunc)

//****************************************************************
