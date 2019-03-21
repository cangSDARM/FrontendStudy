var express = require('express');
var graphHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

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
		return {
			name: "JoneDo",
			age: 18
		}
	},
	length: ({ unit, numSides })=>{
		return [1, 2, 3]
	}
};

var app = express();
app.use('/graphql', graphHTTP({
	schema: schema,
	rootValue: root,
	graphiql: true		//是否启用开发界面
}));

//公开文件夹, 供用户访问静态资源
app.use(express.static('public'))
app.listen(3000);
