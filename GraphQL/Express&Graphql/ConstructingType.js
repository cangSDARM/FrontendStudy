//此处定义和express里定义类似.
var express = require('express');
var graphHTTP = require('express-graphql');
var graphql = require('graphql');

var AccountType = new graphql.GraphQLObjectType({
	name: 'Account',
	fields: {
		name: { type: graphql.GraphQLString },
		age: { type: graphql.GraphQLInt }
	}
})

var queryType = new graphql.GraphQLObjectType({
	name: 'Query',
	fields: {
		account: {
			type: AccountType,
			resolve: function(_){
				return {
					name: 'xx',
					age: 18
				}
			}
		},
		length: {
			type: graphql.GraphQLFloatArray,
			args: {
				unit: {
					type: graphql.GraphQLString,
					value: "undefind"
				},
				numSides: {
					type: graphql.GraphQLInt
				}
			},
			resolve: function(_, { unit, numSides }){
				return [1, 2, 3]
			}
		}
	}
})

var schema = new graphql.GraphQLSchema({ query: queryType })

const app = new express();

app.use('/graphql', graphHTTP({
	schema: schema,
	graphql: true
}))

app.use(express.static('public'))
app.listen(3000);