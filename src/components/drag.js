// 鼠标拖放.
// 需要考虑:
// 		1. React鼠标事件系统
// 		2. 判断拖放开始和结束
// 		3. 实现拖放元素的位置移动
// 		4. 拖放状态如何维护

// 第三方滚动库:
import dnd from 'react-beautiful-dnd';

//**************************************例子: 纵向移动li组件
import React from 'react'

const list = [];
for (let i = 0; i < 10; i++) {
  list.push(`Item ${i + 1}`);
}

//交换list中两个元素的位置, 产生一个新的数组
const move = (arr, startIndex, toIndex) => {
  arr = arr.slice();
  arr.splice(toIndex, 0, arr.splice(startIndex, 1)[0]);
  return arr;
};

const lineHeight = 42;
class DndSample extends Component {
  constructor(props) {
    super(props);
    this.state.list = list;
  }
  state = {
    dragging: false,
    draggingIndex: -1,
    startPageY: 0,
    offsetPageY: 0,
  };

  handleMounseDown = (evt, index) => {
    this.setState({
      dragging: true,		//拖放过程中
      startPageY: evt.pageY,	//记录现在的Y值
      currentPageY: evt.pageY,//当前的Y值
      draggingIndex: index,	//哪一个正在移动
    });
  };
  handleMouseUp = () => {
    this.setState({ dragging: false, startPageY: 0, draggingIndex: -1 });
  };
  handleMouseMove = evt => {
  	// 偏移值
    let offset = evt.pageY - this.state.startPageY;
    const draggingIndex = this.state.draggingIndex;

    //大于某行高
    if (offset > lineHeight && draggingIndex < this.state.list.length - 1) {
      // move down
      offset -= lineHeight;
      this.setState({
        list: move(this.state.list, draggingIndex, draggingIndex + 1),
        draggingIndex: draggingIndex + 1,
        startPageY: this.state.startPageY + lineHeight,
      });
    } else if (offset < -lineHeight && draggingIndex > 0) {
      // move up
      offset += lineHeight;
      this.setState({
        list: move(this.state.list, draggingIndex, draggingIndex - 1),
        draggingIndex: draggingIndex - 1,
        startPageY: this.state.startPageY - lineHeight,
      });
    }
    this.setState({ offsetPageY: offset });
  };

  getDraggingStyle(index) {
    if (index !== this.state.draggingIndex) return {};
    //transform 未拖动完成时的位置显示
    return {
      backgroundColor: "#eee",
      transform: `translate(10px, ${this.state.offsetPageY}px)`,
      opacity: 0.5,
    };
  }

  render() {
    return (
      <div className="dnd-sample">
        <ul>
          {this.state.list.map((text, i) => (
            <li
              key={text}
              onMouseDown={evt => this.handleMounseDown(evt, i)}
              style={this.getDraggingStyle(i)}
            >
              {text}
            </li>
          ))}
        </ul>

        {/*设置一个占满全屏的拖动层, 监听mouse事件*/}
        {this.state.dragging && (
          <div
            className="dnd-sample-mask"
            onMouseMove={this.handleMouseMove}
            onMouseUp={this.handleMouseUp}
          />
        )}
      </div>
    );
  }
}

export default DndSample;