# Vue

<!-- TOC -->

- [入门 Tips](#入门-tips)
- [组件](#组件)
  - [Mustache](#mustache)
  - [多组件通信](#多组件通信)
  - [插槽](#插槽)
- [必装](#必装)
  - [Route](#route)
  - [Vuex](#vuex)
- [其它](#其它)

<!-- /TOC -->

- Vue 是第一次 HTML 树渲染后，再执行 Vue 替换模板字符串达到渲染
- [生命周期](https://cn.vuejs.org/images/lifecycle.png)
- Vue 会尽量复用已存在元素，而不是重新创建新的元素
- Vue 数据不是完全响应式的。（例如数组只有添加、排序、删除是）需要使用 Vue.set(val, index, nV)来修改<!--什么傻逼设定-->
- Vue 的 Template 需要一个确切的根元素 <!--莫名其妙。讲道理，这样不如用jsx-->

## 入门 Tips

```js
import Vue from "vue";
new Vue({
  el: "#app",
  render: (h) => h(Component),
});
// 等价于
new Vue({
  render: (h) => h(Component),
}).$mount("#app");
```

## 组件

- component.\_\_proto\_\_ === Vue.prototype;

### Mustache

> 支持简易运算

```vue
<div>{{name + " " + "sel"}}</div>
<div>{{counter * 2}} {{cast}}</div>
```

> 使用

```vue
<keep-alive
  include="ComponentName"
  exclude="ComponentName,C"
>保证内容不会被销毁。通常配合route使用</keep-alive>

<div v-once>固定内容。msg不会发生改变 {{msg}}</div>

<div v-html="url">显示插入的HTML文档</div>

<div v-pre>显示纯文本，不解析模板字符串</div>

<div v-cloak>在Vue解析之前有v-cloak属性，解析完后就会没有。(通常配合CSS用</div>

<div :src="url">v-bind:动态绑定Attribute。语法糖：省略v-bind字样</div>

<div v-bind:class="{ active: true, disable: false }">动态绑定Class</div>

<div v-if="false == undefined">false不渲染子组件。还有v-else-if，v-else</div>

<div v-show="true">v-show会保留在DOM中，只是toggle CSS的display</div>

<div key="url">加个key提示别乱复用</div>

<div>{{用于过滤器的item | fitter}}</div>

<div
  v-model.lazy="msg"
>双向绑定。多用于表单组件。修饰符lazy表示失去焦点调用，其它参看文档</div>

<div>{{msg}}</div>
<!--等价于React的 <div>{this.state.msg}</div>-->

<div v-for="(item, key, index) in de" :key="item.id">{{item}}</div>
<!--等价于React的 { item.map((item,index)=><div key={item.id}>item</div>) }-->

<div v-on:click="click">语法糖：把v-on:换成@字样</div>
<!--等价于React的 <div onClick={this.click}></div>-->
<div @click="click">def click(e): 自动传event</div>
<div
  @click="click('as', $event)"
>def click(d, e): 需要绑定参数, as是个变量</div>
<div
  @click.stop="click"
>def click: stopPropagation()。提供修饰符(.stop, .prevent)阻止浏览器默认行为</div>
```

> 声明

```js
export default {
  data: () => {
    //等价于 React 的 this.state
    return {
      msg: "data",
      de: [1, 2, 3],
    };
  },
  components: {
    Component1,
  },
  computed: {
    //就是把需要计算的东西扔到这里来计算。之后再替换。和普通模板字符串一样，不用加括号（有缓存）
    computedValue: {
      //getter+setter
      get() {
        return this.msg + 2 + 3;
      },
      set(nV) {},
    },
    computedVal: () => 2 + 3, //getter
  },
  beforeMount: () => {
    /*生命周期函数*/
  },
  methods: {
    //for v-on，也可以放innerText中。无缓存
    click: (...e) => {
      this.msg = "clicked";
    },
  },
  filters: {
    //过滤器
    filter: (item) => item * 2,
  },
  watch: {
    //监听data改变
    msg(nV, oV) {
      this.msg = nV;
    },
  },
};
```

### 多组件通信

> 父 -> 子

```vue
<!--父组件-->
import Child from './child.vue'; export default{ components: { Child, } }
<!--使用。不能使用驼峰-->
<Child :need-val="val" />

<!--子组件-->
export default { props: { needVal: Array, //prop-types mess: { type: String,
default: ()=>'msg', validator: ()=>true, required: true, } } }
<!--调用-->
<div>{{needVal}}</div>
```

> 子 -> 父

```vue
<!--子-->
export default{ methods: { toParent: (...args)=>{ this.$emit('funcTon',
...args); } } }

<!--父-->
<Child @funcTon="click"></Child>
export default{ methods:{ click: (args)=>{ console.log(args); } } }
```

> 直接访问

```vue
<!--父-->
this.$children.XX

<!--子-->
this.$parent.XX

<!--Vue实例-->
this.$root.XX

<!--ref-->
<div ref="div"></div>
this.$refs.div this.$refs.div.$el //原生元素
```

### 插槽

> 匿名

```vue
<!--在template中声明。内容为默认值-->
<slot><div>default</div></slot>

<!--使用，则slot的地方被span替代-->
<Child><span>1</span></Child>
```

> 具名

```vue
<slot name="slot"></slot>

<!--非具名的需要非具名的来替换，具名的需要具名的来替换-->
<Child><span slot="slot"></span></Child>
```

> 向上传数据 <!--不知到vue怎么想的。这么难到不混乱么？你TM都有子传父的方法了-->

```vue
<slot :data="toPopData"></slot>

<!--使用。template字样是必须的。之前版本报错请看官方文档-->
<Child>
	<template v-slot:default="slot">
		{{slot.toPopData}}
	</template>
</Child>
```

## 必装

### Route

> install

```
1. npm install vue-router
2. src/router/index.js
  import Router from "vue-router";
  import Vue from "vue";
  Vue.use(Router);
  const router = new Router({
  	routes: [],
  	mode: "history"
  });
  export default router;
3. src/main.js
  import router from "./router";
  Vue.config.productionTip = false;
  new Vue({
  	router,
  }).$mount("#app");
```

> register

```js
import Home from ...;
const router = new Router({
	routes: [
		{
		  path: "/",
		  component: Home,
		  children: [	//deeper route. be used in parent component
		    {
		      path: "",
		      redirect: "child"
		    },
		    {
		      path: "child",
		      component: Child,
		    }
		  ]
		},
		{
		  path: "/about/:usrid",
		  redirect: "/",
		},
		{
		  //lazy load
		  path: "/usr"
		  component: ()=>improt("./home"),
		}
	],
});
```

> use

```vue
<router-link
  to="/home"
  tag="div"
  replace
  active-class="active"
>Home</router-link>
<router-link
  :to="{
    path: '/user',
    query: {
      name: 12,
      age: '13',
    },
  }"
>Object</router-link>
<router-view>组件的展示位置</router-view>

this.$router.push('/codeJump'); //router controller object
this.$route.params.usrid; //active route object
```

> guard

```js
//in src/router/index
//each jump to new navigator call
router.beforeEach((to, from, next) => {
  next();
});
router.afterEach((to, from) => {});
```

### Vuex

**`Component` -Dispatch-> `Actions` -Commit-> `Mutation` -Mutate-> `State` -Render-> `Component`**<br>

- 和 Vue 一样，有“响应式缺陷”。使用`Vue.set, Vue.delate`解决 <!--挺傻逼的。不如React直接装个api来得好-->

> install

```js
1. npm install vuex
2. src/store/index.js
  import Vuex from "vuex";
  import Vue from "vue";
  Vue.use(Vuex);
  const store = new Vuex.Store({

  });
  export default store;
3. src/main.js
  import store from './store';
  new Vue({
  	store,
  }).$mount("#app");
```

> store

```js
const store = new Vuex.Store({
  state: {}, //default state
  mutations: {
    //reduce, synchronous
    changeState: (state, payload) => {
      //payload === Redux.action
      state.xx = xx;
    },
  },
  actions: {
    //reduce, asynchronous
    update: (context, payload) => {
      //context == store
      //axios in there.
      context.commit("update"); //do mutate

      return new Promise.resolve("callback");
    },
  },
  getters: {
    //computed
    get: (state) => {
      return state.xx.filter((s) => s.id > 1);
    },
    getinget: (state, getters, rootState) => {
      //rootState, for modules
      return getters.get.length;
    },
  },
  modules: {
    //combineReducers
    mod: {
      state: {}, //this.$store.mod.xx
      mutations: {}, //this.$store.commit('')
      actions: {}, //private for each module
      getters: {}, //this.$store.getter.xx
      moudules: {},
    },
  },
});
```

> use

```js
<div>{{$store.state.xx}}</div>
<div>{{$store.getters.get}}</div>

export default{ computed: { //other self computed, ...mapState({ count:
state=>state.count, count: 'count', //same as last line withSelfData(state){
//使用 `this` 获取局部状态，必须使用常规函数 return state.count +
this.localCount } }) }, methods: { dispatched: ()=>{ //can but not recommended
//this.$store.commit('changeState', {args}); //action this.$store.dispatch({
type: 'changeActions', data: args, }).then(r=>console.log(r)); //mutate
this.$store.commit({ type: 'changeState', data: args }) } } }
```

## 其它

- 事件总线[实现](https://www.cnblogs.com/fanlinqiang/p/7756566.html)
