<!-- TOC -->

- [CSS3 中的新规则](#css3-中的新规则)
  - [访问节点属性](#访问节点属性)
  - [单位](#单位)
  - [伪类](#伪类)
    - [子级匹配选择器](#子级匹配选择器)
  - [条件查询](#条件查询)
    - [父容器尺寸](#父容器尺寸)
    - [CSS 语法查询](#css-语法查询)
  - [元素形状](#元素形状)
    - [圆角](#圆角)
    - [半圆、多边形](#半圆多边形)
    - [内凹图形](#内凹图形)
  - [文字排版](#文字排版)
    - [文字环绕](#文字环绕)
  - [主题](#主题)
- [其他注意事项](#其他注意事项)

<!-- /TOC -->

## CSS3 中的新规则

### 访问节点属性

> [描述](https://developer.mozilla.org/zh-CN/docs/Web/CSS/attr)

```css
p:before {
  content: attr(data-foo) " "; /*暂时只有 伪类 的content可用*/
}
```

### 单位

[更多](https://developer.mozilla.org/zh-CN/docs/Web/CSS/length)

```scss
html {
  font-size: 14px;
}
#REM_EM {
  font-size: 1.2rem; /* 1.2 * rem(14px) = 16.8px */
  #EM {
    width: 1em; /* 1em = nearest defined font-size, 这里是 16.8px */
  }
}
#VH_VM {
  height: 100vh; /* 1vh = viewport高度的1/100 */
  width: 100vw; /* 1vw = viewport宽度的1/100 */
}
#VMIN_VMAX {
  height: 100vmin; /* 1vmin = Min(viewport宽度, viewport高度)/100 */
  height: 100vmax; /* 1vmax = Max(viewport宽度, viewport高度)/100 */
}
#EX {
  font-size: 1ex; /* 1ex = x-height 或者 一个em的一半 */
  x-height: "当前字体中, 小写字母x的高度";
}
#CH {
  font-size: 1ch; /* 1ch = 0-width/0-height 或者 0.5em/1em */
  0-width: "当前字体中, 数字0的宽度";
  0-height: "当前字体中, 数字0的高度";
}
#CM_MM_IN_PC_PT {
  #CM {
    width: 1cm; /* 1cm = 96px/2.54 */
  }
  #MM {
    width: 1mm; /* 1mm = 1/10cm */
  }
  #IN {
    width: 1in; /* 1in = 2.54cm = 96px */
  }
  #PC {
    width: 1pc; /* 1pc = 12pt = 1/6in */
  }
  #PT {
    width: 1pt; /* 1pt = 1/12pc = 1/72in */
  }
}
```

### 伪类

> [更多](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Selectors)

```css
:root {
} /*匹配文档树的根元素。对于 HTML 来说，:root 表示 <html> 元素，除了优先级更高之外，与 html 选择器相同*/
:defined {
} /*表示任何已定义的元素。这包括任何浏览器内置的标准元素以及已成功定义的自定义元素 (例如通过 CustomElementRegistry.define() 方法)*/
:default {
} /*表示一组相关元素中的默认表单元素。如: button, input, option*/
:empty {
} /*代表没有子元素的元素。子元素只可以是元素节点或文本（包括空格）*/
:first-of-type {
} /*选择在父元素中第一个出现的元素，而不管其在兄弟内的位置如何*/
:focus-within {
} /*元素自身或者它的某个后代匹配:focus伪类*/
:indeterminate {
} /*表示状态不确定的表单元素*/
:is(div, span, p, ul) ; /*和 div,span,p,ul {} 一样，但是这样可以组合更为复杂的样式*/
```

#### 子级匹配选择器

父级有该子级，父级才会应用 style

```css
parent:has(> child) {
  direction: rtl;
}
parent:has(child) {
  direction: rtl;
}
```

### 条件查询

#### 父容器尺寸

支持查询父容器大小来实现响应式

```css
parent {
  container-type: inline-size; /*现在只有这个可用*/
  container-name: Cont;
}

/*查询语法和 media query 一致*/
/* name 写了只能用于表明的 container */
@container Cont (size condition) {
  /*内部的元素及可方便设置*/
  .child-cls {
  }
  #child-id {
  }
}
```

#### CSS 语法查询

```css
/* 检测css语法支持情况, 判断的css语法有效则执行内部css */
@supports (transform-origin: 5%) {
  /* specific rules */
}
```

### 元素形状

#### 圆角

> [描述](https://developer.mozilla.org/zh-CN/docs/Web/CSS/border-radius)

```css
/*芒果形状*/
div {
  border-radius: 0px 100px / 120px;
  /* 定义顺序(从top-left开始)：top-left的horizontal vertical -> top-right的vertical horizontal vertical以此类推
    /* / 前面的是以顺时针角度椭圆的第一个被定义的值，后面的是第二个被定义的值, */
}
```

#### 半圆、多边形

> [使用裁剪方式创建元素的可显示区域](https://developer.mozilla.org/zh-CN/docs/Web/CSS/clip-path)

```css
div {
  clip-path: circle(50% at 50% 0);
}
div {
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
}
```

#### 内凹图形

1. 使用`<map>`和`<area>`来创建可点击的内凹图形(实际上其可以[实现任意的可点击区域](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/map))
2. 使用 [CSS Mask](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Masking) 技术来裁切正常图形，以实现内凹图形

### 文字排版

> [更多](https://developer.mozilla.org/zh-CN/docs/Web/CSS/writing-mode)

```css
div {
  direction: rtl; /*从右往左*/
  unicode-bidi: bidi-override;
  writing-mode: horizontal-tb;
}
```

#### 文字环绕

> [Shape](https://developer.mozilla.org/zh-CN/docs/Web/CSS/shape-outside)

```css
/*不一定需要img，div等也可以*/
img {
  /* 图片外形，相邻的内联内容可围绕该形状 */
  shape-outside: url(/media/examples/round-balloon.png);
  /* shape 和外部内联内容的 margin */
  shape-margin: 2px;
  /* shape 边缘 alpha 的阈值 */
  shape-image-threshold: 0.7;
}
```

### 主题

```css
.element {
  color-scheme: light;
}
/** 使用 media-query */
@media (prefers-color-scheme: light) {
  .element {
    color: black;
  }
}
@media (prefers-color-scheme: dark) {
  .element {
    color: white;
  }
}
/** 或者使用 light-dark */
.element {
  /* fallback 的颜色，当用户浏览器不支持 color: light-dark(black, white); 时，回退到这个颜色 */
  color: black;
  /* light mode 下 color 用 black, dark mode 下 color 用 white */
  color: light-dark(black, white);
}
/** 或者使用 计算相对颜色 */
.element {
  --color: white;
  --darken: -255;

  color: rgb(
    from var(--color) calc(r + var(--darken)) calc(g + var(--darken)) calc(
        b + var(--darken)
      )
  ); /* result = rgb(0, 0, 0). 支持所有颜色空间 */
}
```

## 其他注意事项

1. `inline`元素只能包括`block`或`inline`中的一种. 如果有混合内容, 则应该创建匿名的`block`呈现器以包裹`inline`元素
2. [图片版注意事项](./其他注意事项图片版.md)
