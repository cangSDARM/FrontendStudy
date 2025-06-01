import CompileUtil from './CompileUtil';

//不直接操作DOM节点, 而使用内存fragment, 防止页面回流
class Compiler{
	constructor(vm){
		this.el = this.isElementNode(vm.$el) ? el : document.querySelector(el);
		this.vm = vm;

		if(this.el){
			//如果获取到 则开始编译
			//1. 先把DOM移入内存fragment
			let fragment = this.node2fragment(this.el);
			//2. 编译 => 提取想要的元素节点 v-model 和 文本节点 {{}}
			this.compile(fragment);
			//3. 把编译后的文档碎片添加到DOM中去
			this.el.appendChild(fragment);
		}
	}

	/*辅助*/
	isElementNode(node){
		return node.nodeType === 1;	//http://www.w3school.com.cn/jsref/prop_node_nodetype.asp
	}

	isDirective(name){
		return /^v-/.test(name);
	}

	/*核心*/
	node2fragment(el){	//将el内容放入内存中
		//文档碎片
		let fragment = document.createDocumentFragment();
		let child;
		while(child = el.firstChild){
			fragment.appendChild(child);
		}
		return fragment;
	}

	compile(fragment){
		let childNode = fragment.childNodes;
		Array.from(childNode).forEach(node =>{	//childNode是类数组, 需要转成数组才能使用相关方法遍历
			if(this.isElementNode(node)){
			//元素节点
				this.compileEle(node);
				this.compile(node);	//获取内部文本
			}else{
			//文本节点
				this.compileText(node);
			}
		})
	}

	compileEle(node){
		let attrs = node.attributes;
		Array.from(attrs).forEach(attr => {
			//判断需要的属性名 v-*
			if(this.isDirective(attr.name)){
				//取得对应值放到节点中
				let expr = attr.value;
				let [, type] = attr.split('-');
				Reflect.has(CompileUtil, type) && CompileUtil[type](node, this.vm, expr);
			};
		})
	}
	compileText(node){
		let text = node.textContent;
		let reg = /\{\{([^}]+)\}\}/g
		if(reg.test(text)){
			Reflect.has(CompileUtil, 'text') && CompileUtil['text'](node, this.vm, text);
		}
	}
}

export default Compiler;