import React from "react"
/*  引入组件
	- 组件名(Layout)必须以大写字母开头
*/
import Layout from "../componets/layout"

// improt 用default导出的组件时，
// 应为import 类名 from “./…js”

//属性强校验
import PropTypes from 'prop-types'

//更好的redux
import { Provider } from 'react-redux'
//<Provider store={ Store }><Provider>
//  使得子组件可以获取store
//  里面必须只能用一个子元素包裹所有其它元素

// PWA progressvie web application
//	   - 只要服务器支持https, 用户可以在不联网时访问以前的缓存
//	   - 将原有data放在浏览器中
//	   - gatsby没有内置
//import registerServiceWorker from './registerServiceWorker'

//父
class In extends React.Component{
  render(){
    return (
      <Index
        content = {this.state.Layout}   {/*调用子组件, 通过属性传值*/}
        func = {this.fun.bind(this)}    {/*子组件调用父组件方法也需要属性传值, 需要bind*/}
      >
      </Index>
    )
  }
  fun(){}
}

//子
class Index extends React.Component{
	render(){
    const { content } = this.props;   /*和下面等价*/
    return (
      <div>
        {this.props.content}    {/*使用父组件传递的内容. 在父组件: content = xxx*/}
        {/*子组件调用父组件有参函数: (Args) => this.props.Func(Acgs)*/}
      </div>
    )
	}

  handle(){
    this.props.fun()   //子组件都是通过this.props来访问父组件的属性
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