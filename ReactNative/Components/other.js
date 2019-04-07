//fetch. 就是AJAX的一个包
fetch('https://', {
	method: 'POST',
	headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	},
	body: JSON.stringify({
		name: 'xx'
	})
}).then(data=>{
	//fetch数据需要自己转json
	JSON.parse(data._bodyText);
}).catch(err=>{

})