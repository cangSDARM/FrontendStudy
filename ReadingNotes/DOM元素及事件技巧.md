- [CSS 处理](#css-处理)
  - [媒体查询](#媒体查询)
- [检查/搜索元素](#检查搜索元素)
  - [父元素](#父元素)
  - [当前元素](#当前元素)
  - [子元素](#子元素)
  - [窗口坐标](#窗口坐标)
- [节点增删改和移动](#节点增删改和移动)
- [指针事件](#指针事件)
  - [鼠标拖放](#鼠标拖放)
  - [setPointerCapture](#setpointercapture)

## CSS 处理

```ts
style.cssText; //对整个 "style" 进行替换
```

### 媒体查询

```js
window.matchMedia("(min-width: 500px)").addListener(Callback);
```

## 检查/搜索元素

### 父元素

```ts
elem.closest(css); //方法会查找与 CSS 选择器匹配的最近的祖先。elem 自己也会被搜索。

// 复杂的检查
function parentNodesCheck(
  node: HTMLElement,
  checker: (parent: HTMLElement) => boolean,
) {
  let element = node;
  while (element) {
    if (checker(element)) {
      return;
    }

    element = element.parentElement;
    //document.documentElement.parentNode == document
    //document.documentElement.parentElement == null
  }

  return;
}
```

### 当前元素

```ts
elem.matches(css); //不会查找任何内容，它只会检查 elem 是否与给定的 CSS 选择器匹配
```

### 子元素

```ts
elemA.contains(elemB); //如果 elemB 是 elemA 的后代或者 elemA==elemB
```

### 窗口坐标

```ts
// 如果在xy可视区域外，返回null
document.elementFromPoint(x, y); //返回在窗口坐标 (x, y) 处嵌套最多（the most nested）的元素
document.elementsFromPoint(x, y); //所有元素
```

## 节点增删改和移动

![节点插入/移动](../assets/inserthtmlornodes.png)

![过时的插入/移动](../assets/oldinserthtml.png)

> 移动时都会自动删除旧的节点

```ts
node.replaceWith(..."nodes or strings"); //替换 node。
node.remove(); // 移除 node
```

## 指针事件

Simple Guide

1. https://zh.javascript.info/mousemove-mouseover-mouseout-mouseenter-mouseleave
2. https://zh.javascript.info/pointer-events

![指针事件 vs 鼠标事件](../assets/pointerevent.png)

### 鼠标拖放

[sample](https://codepen.io/AllenEyes/pen/OJmzxLg)

### setPointerCapture

- 可以在 `pointerdown` 事件的处理程序中调用 `thumb.setPointerCapture(event.pointerId)`
- **接下来发生的所有指针事件都会被重定向到 `thumb` 上**
- 当 `pointerup/pointercancel` 事件发生、`elem` 被移除、`elem.releasePointerCapture` 调用时，绑定会被自动移除
