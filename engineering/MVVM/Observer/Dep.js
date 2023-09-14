class Dep{
	//发布订阅
	constructor(){
		this.subs = [];
	}
	static target;
	addSub(watcher){
		this.subs.push(watcher);
	}
	notify(){
		this.subs.forEach(watcher=>{
			watcher.update();
		});
	}
}