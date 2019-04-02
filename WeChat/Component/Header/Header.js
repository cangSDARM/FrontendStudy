//需要使用 Component 来注册组件，并提供组件的属性定义、内部数据和自定义方法

Component({
  externalClasses: ['myClass'], //定义 这个后, 允许父组件传递myClass作为子组件的class
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
    addGlobalClass: true,//这样才能在父组件调用时加入class支持
  },
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    innerText: {
      type: String,
      value: 'default value',
    }
  },
  data: {
    // 这里是一些组件内部数据
    someData: {}
  },
  methods: {
    // 这里是一个自定义方法
    customMethod() {}
  }
})

//调用组件:
//1. 在json中:
"usingComponents": {
	"component-tag-name": "path/to/the/custom/component"
}
//2. 在wxml中:
<component-tag-name inner-text="Some text"></component-tag-name>