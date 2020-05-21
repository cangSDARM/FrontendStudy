<!-- TOC -->

[HTML Living Standard: WHATWG, not W3C](https://whatwg-cn.github.io/html/#introduction)

- [标签嵌套层数](#标签嵌套层数)
  - [使用<br/>](#使用br)
  - [CSS3中的新规则](#css3中的新规则)
    - [自定义变量](#自定义变量)
    - [新的伪类](#新的伪类)
    - [圆角](#圆角)
    - [访问节点属性](#访问节点属性)
    - [文字排版](#文字排版)
  - [其他注意事项](#其他注意事项)

<!-- /TOC -->
TODO:

- [CSS 单位](https://www.w3cplus.com/css/7-css-units-you-might-not-know-about.html)
- [二维倾斜Transform](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-function/skew)
- [Shape](https://developer.mozilla.org/zh-CN/docs/Web/CSS/shape-outside)
- [Grid布局](https://developer.mozilla.org/zh-CN/docs/Web/CSS/grid-auto-flow)
- [混合模式，mix-blend/background-blend/isolation/filter](https://developer.mozilla.org/zh-CN/docs/Web/CSS/mix-blend-mode)
- [片段模板，box-decoration-break]
- [二元操作符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators)
- [类表达式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/class)
- [对象解构](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
- [可迭代协议](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols)

## 标签嵌套层数
```c++
// Chrome只允许最多20层同类型标记的嵌套，如果嵌套更多，就会全部忽略
bool HTMLParser::allowNestedRedundantTag(const AtomicString& tagName){
    unsigned i = 0;
    for(HTMLStackElem* curr = m_blockStack;
        i < cMaxRedundantTagDepth && curr && curr->tagName == tagName;
        curr = curr->next, i++){ }
    return i != cMaxRedundantTagDepth;
}
```

### 使用<br/>
```c++
//虽然为了与IE和FireFox兼容, 支持</br>, 但不推荐使用
if(t->isCloseTag(brTag) && m_document->inCompatMode()){
    reportError(MalformedBRError);
    t->beginTag = true;
}
```
### CSS3中的新规则
[更多](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Reference)

#### 自定义变量
> [更多](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)

1. 一个元素上没有定义自定义属性，该自定义属性的值会继承其父元素

```css
div{    /*定义*/
    --div-color: #555;
}
span{   /*使用*/
    color: var(--div-color);
}
```

#### 新的伪类
> [更多](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Selectors)

```css
:root {};   /*匹配文档树的根元素。对于 HTML 来说，:root 表示 <html> 元素，除了优先级更高之外，与 html 选择器相同*/
:defined {}; /*表示任何已定义的元素。这包括任何浏览器内置的标准元素以及已成功定义的自定义元素 (例如通过 CustomElementRegistry.define() 方法)*/
:default {};    /*表示一组相关元素中的默认表单元素。如: button, input, option*/
:empty {};  /*代表没有子元素的元素。子元素只可以是元素节点或文本（包括空格）*/
:first-of-type {};  /*选择在父元素中第一个出现的元素，而不管其在兄弟内的位置如何*/
:focus-within {};   /*元素自身或者它的某个后代匹配:focus伪类*/
:indeterminate {};  /*表示状态不确定的表单元素*/
...
```

#### 圆角
> [描述](https://developer.mozilla.org/zh-CN/docs/Web/CSS/border-radius)

```css
div {
    border-radius: 0px 100px / 120px;
    /* 定义顺序(从top-left开始)：top-left的horizontal vertical -> top-right的vertical horizontal vertical以此类推
    /* / 前面的是以顺时针角度椭圆的第一个被定义的值，后面的是第二个被定义的值, */
}
```

#### 访问节点属性
> [描述](https://developer.mozilla.org/zh-CN/docs/Web/CSS/attr)

```css
p:before {
    content:attr(data-foo) " "; /*暂时只有 伪类 的content可用*/
}
```

#### 文字排版
> [更多](https://developer.mozilla.org/zh-CN/docs/Web/CSS/writing-mode)
```css
div {
    direction: rtl; /*从右往左*/
    unicode-bidi: bidi-override;
    writing-mode: horizontal-tb;
}
```

### 在线和离线事件
[Online/Offline](https://developer.mozilla.org/zh-CN/docs/Web/API/NavigatorOnLine/Online_and_offline_events)

### 其他注意事项
1. `inline`元素只能包括`block`或`inline`中的一种. 如果有混合内容, 则应该创建匿名的`block`呈现器以包裹`inline`元素
2. 使用`<map>`和`<area>`来创建可点击的内凹图形(实际上其可以[实现任意的可点击区域](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/map))
3. [图片版注意事项](./其他注意事项图片版.md)
