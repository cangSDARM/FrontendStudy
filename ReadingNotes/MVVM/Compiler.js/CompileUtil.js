import Watcher from '../watcher';

const CompileUtil = {
	split(expr){
		return expr.split('.');	//message.a.b.c.d
	},
	getVal(vm, expr){	//获取实例上的数据
		expr = this.split(expr);
		return expr.reduce((prev, next)=>{
			return prev[next];
		}, vm.$data);
	},
	textVal(vm, expr){
		return expr.replace(/\{\{([^}]+)\}\}/g, (..args)=>{	// {{message.a}} => hello world
			return this.getVal(vm, args[1]);
		});
	},
	text(node, vm, expr){
		let updater = this.updater['textUpdate'];
		let val = this.textVal(vm, expr);
		expr.replace(/\{\{([^}]+)\}\}/g, (..args)=>{	// {{message.a}} => hello world
			new Watcher(vm, args[1], (newValue)=>{
				//若数据变化, 文本节点需要重新获取依赖的属性更新文本内容
				updater && updater(node, this.textVal(vm, expr));
			});
		});
		updater && updater(node, val);
	},
	setVal(vm, expr, value){
		expr = this.split(expr);
		return expr.reduce((prev, next, currentIndex)=>{
			if(currentIndex === expr.length - 1){
				return prev[next] = value;
			}
			return prev[next];
		}, vm.$data);
	},
	model(node, vm, expr){
		let updater = this.updater['modelUpdate'];
		new Watcher(vm, expr, ()=>{
			updater && updater(node, this.getVal(vm, expr));
		});
		node.addEventListener('input', (e)=>{
			let newValue = e.currentTarget.value;
		});
		updater && updater(node, this.getVal(vm, expr));
	},
	updater = {
		textUpdate(node, value){	//文本更新
			node.textContent = value;
		},
		modelUpdate(node, value){	//节点更新
			node.value = value;
		}
	},
}

export default CompileUtil;