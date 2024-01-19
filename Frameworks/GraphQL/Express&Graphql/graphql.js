//注释: #

//查询:
query {
	hello
	account
	/*会自动补全为:
	account{
	 	name
	 	age
	}
	*/

	/*
	别名:
	ep1: account{
		name
		age
	}
	ep2: account{
		name
		age
	}
	 */
}

//返回:
{
	"data": {
		"hello": "Hello World!",
		"account": {
			"name": "JoneDo",
			"age": 18
		}
	}
}