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