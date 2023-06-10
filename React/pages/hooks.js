//react-hooks 是基于函数式编程的思想, 使得"无状态"组件可以增加状态.
//而且可以很好的自定义hook, 来达到减少包装层的目的
//很明显, 不能在class里使用hook
//
//tips:
//	同一hook函数可以在一个函数里使用多次
//	只能在函数最高层作用域调用hook, 不能在循环/判断/子函数里使用
//^16.8.0

import React from "react";

const App = (props) => {
  // 需要状态的初始值(没有的置undefined), 可以是个返回初始值的函数
  // 在初次渲染时被调用(only once)
  // 读取值: count, 设定值: setCount
  const [count, setCount] = React.useState(0);
  //两种调用
  // setCount(1);	//newValue
  // setCount(pre => pre + 1);	//function
  //但不会自动合并状态, 需要自己手动合并: setCount(pre=>({...pre, ...new}))

  // 默认等效于: componentDidMount + componentDidUpdate
  // 按照声明顺序调用effect
  // 内部调用顺序: 清除当前effect, 运行下一个effect
  // 异步. 在DOM更新时会延时执行, 而不妨碍视图效果(同步参考useLayoutEffect)
  useEffect(() => {
    document.title = "title";

    // cleanup
    return () => {
      console.log("清除当前effect");
    };
  }, [count]); //仅在count变化时更新; 若传递空数组则仅在组件挂载和卸载时执行effect, 而不是每次渲染; 不传表示每次DidUpdate都调用

  // 接收一个Context对象(React.createContext的返回值),
  // 在Context.Provider包裹后，返回当前context的值.否则一直是默认值
  // 类似于: static contextType = Context
  const value = React.useContext(MyContext);

  // 用于函数防抖
  // value不能是个object，否则React的比较会有问题导致防抖失效
  const deferred = React.useDeferredValue(value);

  // 用于非阻塞式状态
  // 如果要state变化时，UI依然可以互动，则可以使用这个
  // 如果state的计算量不是太大，那么transition是同步的
  // startTransition等同于batchUpdate
  // state变化时，UI互动了，则state会跟着只变一次而不是常规的变化两次
  // startTransition必须是同步的，里的setState不能是异步的(相当于里面setState需要运用hooks规则)
  const [isPending, startTransition] = React.useTransition();
  // 实现可以参考
  simpleTransition();
  // 和useTransition的一样效果，但是没有pending信息
  React.startTransition();

  // 和外部数据同步的
  // subscribe应该返回一个unsubscribe的函数，每次变化需要调用一个callback通知React重新渲染
  // getSnapshot返回当前外部状态下的数据
  // 只要store变化，react就会重新渲染(这样外部数据就是最新的，可以不需要在react中管理数据)
  const snapshot = React.useSyncExternalStore(subscribe, getSnapshot);

  // 类似于redux逻辑的react lite版本.
  //使用前请参考官方文档
  const [state, dispatch] = React.useReducer(reducer, init);

  // 返回function的memoized版本(将上次的计算结果缓存起来, 若遇到相同参数则返回缓存中的数据)
  const memoizedCallback = React.useCallback(function () {}, [a, b, c]);

  // 返回memoized值
  // 在每次渲染时运行. 适合做大量的运算
  const memoizedValue = React.useMemo(() => {}, [a, b, c]);

  // 生成服务器端及客户端统一的唯一id
  // 多半时间用于SSR
  // 生产依赖于parent path，如果组件树不一样，id会变化
  const id = React.useId();

  // 返回可变的ref对象, 其.current是其对应dom节点
  // ref变化时, useRef不会重新调用. 若变更.current也不会导致重新渲染(使用useCallback来实现)
  // 其实可以包裹任何元素. 可以当做一个实例变量来使用它
  const ref = React.useRef(null);

  // 使用这个来使得父组件可以调用ref的相关内容
  // 需要结合forwardRef
  //使用前请参考官方文档
  React.useImperativeHandle(ref, () => ({}), [deps]);

  // 同useEffect相同的api. 每次DOM布局改变后立刻调用
  React.useLayoutEffect(() => {}, []);

  // 组件挂载前调用
  // 每次调用时先运行cleanup再运行effect(目的是为了挂载css)
  // 无法在里面调用setState、ref因为组件还未挂载
  React.useInsertionEffect(() => {}, []);

  // 在DevTools上显示信息
  React.useDebugValue("info", (info) => info.toString());

  return <div>React-Hooks</div>;
};

//自定义hook
//	必须以 use 开头(保证hook的正确使用和声明)
//	可以内嵌任意hook
//	返回值和参数都随意
//使用相同的hook不会共享state
//每次使用的hook内部state都是不同的
function useList(args) {
  return xxx;
}

function simpleTransition() {
  let isInsideTransition = false;

  function startTransition(scope) {
    isInsideTransition = true;
    scope();
    isInsideTransition = false;
  }

  function setState() {
    if (isInsideTransition) {
      // ... schedule a transition state update ...
    } else {
      // ... schedule an urgent state update ...
    }
  }
}
