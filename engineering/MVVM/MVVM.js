import Compiler from './Compiler/';
import Observer from './Observer/';
import Watcher from './watcher';

class MVVM {
	constructor(options){
		//把可用东西挂载到实例上
		this.$el = options.el;
		this.$data = options.data;

		//如果有要编译的模板就开始编译
		if(this.$el){
			//数据劫持, 把所有对象属性改为 get 和 set
			new Observer(this.$data);

			this.proxyData(this.$data);

			//用数据和元素开始编译
			new Compiler(this);
		}
	}

	// vm.$data.message ->> vm.message
	proxyData(data){
		Object.keys(data).forEach(key=>{
			Object.defineProperty(this, key, {
				get(){
					return data[key];
				},
				set(nV){
					data[key] = nV;
				}
			})
		})
	}
}