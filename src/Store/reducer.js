import update from 'immutability-helper'
//https://github.com/kolodny/immutability-helper
//npm install immutability-helper --save

import produce from 'immer'
//https://www.npmjs.com/package/immer
//npm install immer

//默认数据
const defaultState = {
  inputValue: '',
  list: []
}

/*
  Reducer可以接收state, 但不能直接修改state否则不会更新state
  当给定固定输入, 输出必须也固定
 state: 上一次在store中存储的数据
 action: 组件事件
 */
export default (prestate = defaultState, action) => {
  switch(action.type){
    case "x":
      //使用update工具更新
      //推荐
      return update(state, {
        inputValue: {$set: action.inputValue}
      });
    case "xx":
      return prodduce(state, draftState=>{
        draftState.list = [1, 2, 3]
      })
    case "xxx":
      //assign(原数据, 新数据1, 新数据2 ...)
      //不推荐
      //https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
      return Object.assign({}, state, { list:
        [1, 2]
      })
    case "xxxx":
      //ES6, 解构赋值. 如果有list,就更改为下面的新list, 其它的不变
      //不推荐
      return {
        ...state,
        list: [1, 2, 3]
      }
    default:
      return prestate;
  }
}
//***************************************************************

//****************************************整合reducers
import { combineReducers } from 'redux'

// 可以将内部的reducer变为immutable的
import { combineReducers } from 'redux-immutable'

const Reducer = combineReducers({
  reducerA: A,
  reducerB: B
})
export default Reducer;
//整合后调用需要增加: state.reducerA.数据
//***************************************************************

//*****************************************非immutable.js风格
/connect 写在layout.js中, 从123行开始/

//使用 bindActionCreators的
//  只改变了Dispach
import { bindActionCreators } from 'react-redux';
const MapDispatch => (dispatch)=>{
  return {
    actions: bindActionCreators({
      Action1,
      Action2
    }, dispatch),
    //调用: this.props.actions.Action1(e.target)
  }
}
//***************************************************************

//*****************************************immutable.js风格
import { fromJS } from 'immutable'
//只有store是immutable的.
//内部的最好不要用!!!
/**扩展内容
 *如果非要用：
 *    Set很麻烦: action(value){
 *      type: xxx,
 *      fromJS(value)
 *    }
 *    Get也很麻烦: list[i]不行. 用: Nlist = list.toJS(); Nlist[i]
*/
const sotre = fromJS({
  list:
  action: false
})

export default (state=store, action){
  switch(action.type){
    case 1:
      return state.set('list', action.list)
    case 2:
      return state.merge({
        list: action.list,
        action: action.action
      })
  }
}
//只改变了 State
const MapState = (state)=>{
  return {
    action: state.get('action')
    list1: state.getIn(['list', 'a']) //Get the list.a
  }
}
//****************************************************************
