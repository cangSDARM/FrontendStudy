import React from 'react';

//************************************消息订阅包
import Pubsub from 'pubsub-js';

Pubsub.subscribe('delate', function(data){})	//订阅

Pubsub.publish('delate', data)	//发布
//****************************************************************

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

//************************************高阶组件
// 高阶组件接受组件作为参数, 返回一个新的组件
// 		类似于python的装饰器, 由内部包装决定
function hyperFunc(Component){		//定义
	return class extends React.Component {
		state = {time: new Date()};
		componentDidMount(){
			this.timerID = setInterval(()=>this.tick(), 1000);
		}
		componentWillUnmount(){
			clearInterval(this.timerID);
		}
		tick(){
			this.setState({
				time: new Date();
			});
		}
		render(){
			return <Component time={this.state.time}>
				{...this.props}
			</Component>
		}
	}
}
const Index = (props)=>(	//使用
	<div>
		{props.time.toLocaleString()}
	</div>
)
export default hyperFunc(Index);
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

//*************************************Text Only Component
//允许只返回纯字符串的组件
//减少组件的层级嵌套
const Compon = ({text}) => text.replace(".", ":");

class App extends React.Component{
	render(){
		return <Compon text={"1. 2. 3."}/>
	}
}
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
import loadable from 'react-loadable';

const PageLoad = loadable({
	loader: ()=> import('./Index'),		//需要加载的组件
	loading: ()=> <div>loading</div>,	//加载时显示的信息
});

React.lazy
  https://reactjs.bootcss.com/docs/code-splitting.html

//****************************************************************

//*************************************React Portals
// >=16.3
// 将虚拟DOM映射到任何真实DOM节点
// 解决了漂浮层问题
// 除了渲染位置不同外, 和其它组件相同
ReactDOM.createProtal(
	this.Dialog(),		//虚拟节点
	document.getElementById("Dialog-Wapper"),	//真实存在的DOM节点. 不能是React渲染出来的虚拟节点
)
//****************************************************************

//*************************************React Error Boundaries
// >=16.x
// 通过一个生命周期方法捕获子组件的所有异常
// 只能捕获子组件的异常，而不能捕获自身出现的异常
// 只能捕获Render和生命周期方法中出现的异常
// 只能在Create-React-App中使用. 其它配置情况自己百度
componentDidCatch(error, info){
	*@param error: 被抛出的异常
	*@param info: 包含异常堆栈列表的对象
	console.error({error: info})
}
详细参考:
	https://blog.csdn.net/liwusen/article/details/78521006
//****************************************************************

//*************************************性能优化
// 只有数据变化时, 才调用函数
// 可以使用momorized函数代替(参考hooks)
import { createSelector } from 'reselect';
const item = data => data.items;	//所有需要监听的数据
const dataSelector = createSelector(
	item,
	(item)=>{
		//item 不变时, 返回缓存的数据
		return data * 5;
	}
)

//**************************************React.memo
//^16.6.0
// 类似于class形式的PureComponent, 内部实现了浅比较来优化function组件
// 一个高阶组件
const Comp = React.memo(function MyMemoComp(props){
	/*only rerenders if props change*/
})

//****************************************************************

Time Slicing和Subspense
	https://segmentfault.com/a/1190000013524698
React16 Fiber架构
	http://zxc0328.github.io/2017/09/28/react-16-source/
React16 生命周期改动
	https://juejin.im/post/5abf4a09f265da237719899d
React 后期版本特性
	https://www.reactjscn.com/blog/2018/10/23/react-v-16-6.html
Suspense
	https://www.colabug.com/5397403.html
React 各种Demo
	https://codesandbox.io/search?query=React
Rust in React
  https://www.newline.co/fullstack-react/articles/rust-react-and-web-assembly/
