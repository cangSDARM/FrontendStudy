import React from 'react';

//************************************消息订阅包
import Pubsub from 'pubsub-js';

Pubsub.subscribe('delate', function(data){})	//订阅

Pubsub.publish('delate', data)	//发布
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
