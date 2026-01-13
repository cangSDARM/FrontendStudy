- [Custom Event](#custom-event)
- [Constructable Stylesheets](#constructable-stylesheets)
- [Custom Elements](#custom-elements)
  - [Autonomous custom elements](#autonomous-custom-elements)
  - [Customized built-in elements](#customized-built-in-elements)
- [ShadowDOM](#shadowdom)
  - [事件](#事件)
- [Template](#template)
  - [With Slots](#with-slots)

## Custom Event

dispatchEvent -> EventTarget() <- addEventListener

```js
const target = new EventTarget();

target.addEventListener(
  "eventName",
  (evt) => {
    console.log(evt.detail);
  },
  { capture: true },
);

// 只有 detail 是有效的载荷，其他属性都会被忽略
target.dispatchEvent(new CustomEvent("eventName", { detail: "data" }));
```

## Constructable Stylesheets

即让 CSS 可以像类一样管理

`CSSStyleSheet` 对象是 index-based 管理的，因此需要自己注意哪条 rule 对应哪个 index

```js
const sheet = new CSSStyleSheet();
// replace all rules
sheet.replaceSync("a { color: red; }");
// add a rule
sheet.insertRule("* { background-color: blue; }", 0);
// delete a rule
sheet.deleteRule(0);

const rules = sheet.cssRules;
for (const rule of rules) {
  rule.selectorText; // 即 css selector (一样的string)
  rule.style; // 即 style 对象
}

// 注册 or shadowRoot.adoptedStyleSheets
// adoptedStyleSheets 被假定在 Document.styleSheets 中的样式表之后
document.adoptedStyleSheets.push(sheet);
```

## Custom Elements

全局 API

- `window.customElement.define(name, Class)` 注册元素(重复注册会报错)
- `window.customElements.get(name)` 返回指定 custom element 的类
- `window.customElements.getName(Class)` 返回指定 custom element 的名称
- `window.customElements.whenDefined(name)` 在该 custom element 变为已定义状态的时候(define 调用时) resolve
- `window.customElement.upgrade(element)` 升级(绑定原型链)通过 createElement 创建的元素(还没有挂载在 DOM 中)

### Autonomous custom elements

自主自定义标签，继承自抽象类 HTMLElement

修改内容用`this.innerHTML`或其他相关 API

```js
class MyElement extends HTMLElement {
  constructor() {
    super();
    // 允许访问关联对象:
    //  - form: this.#internals.form
    //  - formState: this.#internals.validity/willValidate/validationMessage
    //  - shadowDOM: this.#internals.shadowRoot
    //  - label: this.#internals.labels
    //  - ARIA属性: this.#internals.ariaXXX
    //  - css selector: this.#internals.states (a Map)
    this.#internals = this.attachInternals();
    // 元素在这里创建
  }

  // css selector
  // css: my-element:state(selected)
  get selected() {
    return this.#internals.states.get("selected");
  }
  set selected(s) {
    this.#internals.states.set("selected", s);
  }

  // 在元素被添加到文档之后，浏览器会调用这个方法
  //（如果一个元素被反复添加到文档／移除文档，那么这个方法会被多次调用）
  // WARN：此时无法访问内部子元素(因为 HTML 从外向内构建)
  // WARN: 元素移动时也会调用
  connectedCallback() {
    this.#internals.states.add("selected");
  }

  // 在元素从文档移除的时候，浏览器会调用这个方法
  // （如果一个元素被反复添加到文档／移除文档，那么这个方法会被多次调用）
  disconnectedCallback() {}

  static get observedAttributes() {
    return [
      /* 属性名数组(string[])，这些属性的变化会被监视 */
    ];
  }

  // 当上面数组中的属性发生变化的时候，这个方法会被调用
  attributeChangedCallback(name, oldValue, newValue) {}

  // 在元素被移动到新的文档的时候，这个方法会被调用
  // （document.adoptNode 会用到, 非常少见）
  adoptedCallback() {}

  // 还可以添加更多的元素方法和属性
}

// 注册(名称中必须包含一个短横线, 只能由小写字母组成)
window.customElements.define("my-element", MyElement);
// 可以使用来创建
document.createElement("my-element");
```

### Customized built-in elements

自定义内建元素，继承自内建的元素，如 HTMLButtonElement

和自主自定义标签大致相同

> Safari does not plan to support this

```js
class MyButton extends HTMLButtonElement {
  /* custom element 方法 */
  constructor() {
    super();
    this.addEventListener("click", () => console.log("click"));
  }
}

// 注册
window.customElements.define("my-button", MyButton, { extends: "button" });
// 使用 "is"属性
// <button is="my-button" ></button>
```

## ShadowDOM

如果一个元素同时有两种子树，那么浏览器只渲染 shadow tree

- js: 这个 DOM 树内容无法在外部树中访问(如 querySelector)
- css: 可拥有局部样式规则，但不会被外部树效果影响
  - 自定义 css 属性可以穿透 ShadowDOM
  - `:host/:host([selector])`: ShadowDOM 的 Root 元素
  - `:host-context(selector)`: 只应用于 selector 内部的 ShadowDOM Root

```js
// element 只能是：自定义元素/article/aside/blockquote/body/div/footer/h1…h6/header/main/nav/p/section/span
const element = document.querySelector("span");
// 「open」 —— shadow root 可以通过 elem.shadowRoot 访问
// 「closed」 —— elem.shadowRoot 永远是 null
const mode = "open";

const shadow = element.attachShadow({ mode });
shadow.innerHTML = `<p>
      Hello, ${element.getAttribute("name")}
    </p>`;
shadow.host === element;
```

### 事件

ShadowDOM 的事件会`retarget`: 对于内部来说，路径是正常的；对于外部来说，事件的 target 是 ShadowDOM Root

只有`composed: true`的事件会被冒泡到外部 DOM

## Template

`<template>` 元素用来存储 HTML 模板。
浏览器会忽略内容，仅检查语法的有效性。
但`<template>`是个**真实存在的节点**

主要用法(等价于 DocumentFragment):

```js
let template = document.getElementById("template1");
let templateContent = template.content;

xxx.appendChild(templateContent);
```

### With Slots

类似于 vue，template 里的 `<slot name="xyz">content</slot>` 会被`<xxx slot="xyz" />` 替换，
同时支持匿名 slot(包括所有没有用`slot="..."`的节点)。
不同的是，HTML 的 slot 是个**真实存在的节点**

> `slot="..."` 属性仅仅对 template 的直接子代有效。对于嵌套元素它将被忽略

且节点位置并没有被移动，如果用`querySelect('slot="xyz"')`可以发现节点仍在原地

API:

- 更新/监听: slot 内部的变化是立即可见的。也可以通过`slotChange`事件监听(或 MutationObserver)
- 检查节点绑定的 slot: `node.assignedSlot`
- 返回 slot 绑定的节点: `slot.assignedNodes/Elements()`
  - css 选择对应节点: `::slotted(div)`，但是
    - 不能嵌套(`::slotted(div) span`)
    - 不能选子元素(`::slotted(div span)`)
    - 不能用`querySelector`

```html
<template id="t1">
  <slot></slot>
  <slot name="xyz">Fallback Content</slot>
</template>

<!-- use t1 internally -->
<my-element>
  <div>I like to swim.</div>
  <span slot="xyz">John Smith</span>
  <div>...And play volleyball too!</div>
</my-element>

<!-- rendered like: -->

<>
  <slot>
    <div>I like to swim.</div>
    <div>...And play volleyball too!</div>
  </slot>
  <slot name="xyz">
    <span>John Smith</span>
  </slot>
</>
```
