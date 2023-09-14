class Watcher{
	//链接Observer和Compiler
	constructor(vm, expr, cb){
		this.vm = vm;
		this.expr = expr;
		this.cb = cb;
		// 获取旧值
		this.value = this.get();
		this.util = new CompilerUtil();
	}

	get(){
		Dep.target = this;
		let value = this.util.getVal(this.vm, this.expr);
		Dep.target = null;
		return value;
	}
	update(){
		let newValue = this.util.getVal(this.vm, this.expr);
		let oldValue = this.value;
		if(oldValue != newValue) this.cb(newValue);
	}
}

export default Watcher;