var express = require('express');
var graphHTTP = require('express-graphql');
var { buildSchema } = require('graphql');
var mysql = require('mysql')

//链接数据库
var pool = mysql.creatPool({
	connectionLimit: 10,
	host: '127.0.0.1',
	user: 'Admin',
	password: '12333',
	database: 'my_db'
});

//构建schema, 定义查询的语句和类型
var schema = buildSchema(`
	type Account {
		name: String!
		age: Int!
		#! 表示查询这个字段后总会给你返回一个值, 否则报错
	}
	type Query {
		hello: String
		account: Account
		#参数必须是具名的, 而且可以指定默认值
		#其中, 小括号代表形参. 形参需要定义类型
		#! 表示该参数不能为空
		length(unit: String="undefind", numSides: Int): [Float]
	}

	input AccountIn{
		name: String!
		age: Int!
	}
	type Mutation{
		createAccount(inputVa: AccountIn): Account
	}
`);

//定义查询所对应的处理器(resolver)
var root = {
	hello: ()=>{
		return "Hello World!";
	},
	account: ()=>{
		return new Promise((resolve, reject)=>{
			pool.query('select name, age from account', (err, items)=>{
				if(err){
					reject(err);
					return;
				}
				let arr = [];
				for(item in items){
					arr.push({
						name: item.name,
						age: item.age,
					})
				}
				resolve(arr);
			})
		})
	},
	length: ({ unit, numSides })=>{
		return [1, 2, 3]
	},
	createAccount: ({ inputVa })=>{
		const data = {
			...inputVa
		}
		return new Promise((resolve, reject)=>{
			pool.query('insert into account set ?', [data], (err)=>{
				if(err){
					reject(err);
					return;
				}
				resolve(data);
			});
		})
	}
};

var middleware = (request, response, next)=>{
	//是这个页面请求, 且有cookie
	if(request.url.indexOf('/graphql')!==-1 && request.headers.cookie){
		response.send(JSON.stringify({
			error: '401 auth field'
		}));
		return;
	}
	next();
}

var app = express();

app.use(middleware);

app.use('/graphql', graphHTTP({
	schema: schema,
	rootValue: root,
	graphiql: true		//是否启用开发界面
}));

//公开文件夹, 供用户访问静态资源
app.use(express.static('public'))
app.listen(3000);
