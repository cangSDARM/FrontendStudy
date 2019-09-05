class Observer{
	constructor(data){
		this.observe(data);
	}

	observe(data){	//将这个data数据的原有属性该成set和get
		if(!data || typeof data !== "object"){
			return;
		}
		//将数据一一劫持
		Object.keys(data).forEach(key => {
			//劫持
			this.defineReactive(data, key, data[key]);
			this.observe(data[key]);
		});
	}

	defineReactive(obj, key, value){
		let that = this;
		let dep = new Dep();
		Object.defineProperty(obj, key, {
			enumerable: true,
			configurable: true,
			get(){
				Dep.target && dep.addSub(Dep.target);
				return value;
			},
			set(nV){
				if(nV !== value){
					that.observe(nV);	//保证nV是基础数据而不是对象
					value = nV;
					dep.notify();	//数据更新
				}
			},
		})
	}
}

export default Observer;