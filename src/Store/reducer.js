import update from 'react/lib/update'
//https://reactjs.org/docs/update.html
//npm install immutability-helper --save
//  const initialArray = [1, 2, 3];
//  const newArray = update(initialArray, {$push: [4]}); // => [1, 2, 3, 4]

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
      return update(state, {
        inputValue: {$set: action.inputValue}  //使用update工具更新(推荐)
      });
    case "xxx":
      const state = JSON.parse(JSON.stringify(prestate)); //对state进行深拷贝
      return state;
    default:
      return prestate;
  }
}

//整合reducers
import { combineReducers } from 'redux'

const Reducer = combineReducers({
  reducerA: A,
  reducerB: B
})
export default Reducer;
//整合后调用需要增加: state.reducerA.数据


//immutable.js风格
import { fromJS } from 'immutable'

//只有store是immutable的.
//内部的最好不要用!!!
/**扩展内容
 *如果非要用：
 *    将fromJS换成: import { fromJS } from 'redux-immutable'
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
//Get
import { connect } form 'react-redux' //支持状态组件和无状态组件
const MapState = (state)=>{
  return {
    action: state.get('action')
    list1: state.getIn(['list', 'a']) //Get the list.a
  }
}
connect(MapState)(#Component);
