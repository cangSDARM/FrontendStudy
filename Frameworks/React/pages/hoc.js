//************************************高阶组件
// 高阶组件接受组件作为参数, 返回一个新的组件
// 		类似于python的装饰器, 由内部包装决定

/** 属性代理型
 * 1. 控制props
 * 2. hack 组件 ref 并使用
 * 3. 抽象 state
 */
function propsProxy(Component) {
  //定义
  return class extends React.Component {
    // 抽象 state
    state = { time: new Date() };
    componentDidMount() {
      this.timerID = setInterval(() => this.tick(), 1000);
    }
    componentWillUnmount() {
      clearInterval(this.timerID);
    }
    tick() {
      this.setState({
        time: new Date(),
      });
    }
    proc(wrappedComponentInstance) {
      wrappedComponentInstance.method();
    }
    render() {
      const props = Object.assign({}, this.props, {
        // hack 组件 ref 并使用
        ref: this.proc.bind(this),
      });
      // time 就是控制 prop
      return <Component {...props} time={this.state.time}></Component>;
    }
  };
}

/** 反向继承型
 * 1. 渲染劫持
 * 2. 控制 state
 */
function inheritanceInversion(Component) {
  return class extends Component {
    state = { content: "state injected" };
    render() {
      // 渲染劫持
      if (this.props.loggedIn) {
        return (
          <div>
            {this.state.content}
            {super.render()}
          </div>
        );
      } else {
        return super.render();
      }
    }
  };
}

//使用
const Index = (props) => <div>{props.time.toLocaleString()}</div>;
export default inheritanceInversion(propsProxy(Index));
