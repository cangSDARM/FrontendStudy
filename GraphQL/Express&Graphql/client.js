var variables = { userName: 'xx', city: 'beijing'};

//服务器端也得是 userName
//GraphQL 中，所有参数必须具名传递
var query = `
query Account($userName: Int!, $city: String){
	account(userName: $userName){
		name
		age
		salary(city: $city)
	}
}
`;

var mutation = `
mutation {
	createAccount(inputVa: {
		name: "xx",
		age: 18
	}){
		name
	}
}
`;

fetch('/graphql', {
	method: "POST",
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json'
	},
	body: JSON.stringify({
		query: query,
		variables: variables,
	})
})
.then(
	r=> r.json();
)
.then(
	data=> console.log('data retured: ', data);
)