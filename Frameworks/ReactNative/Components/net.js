//-------------------------RN 内置 AJAX
axios('').then().catch();

//-------------------------fetch
fetch('https://', {
	method: 'POST',
	headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	},
	body: JSON.stringify({
		name: 'xx'
	})
})
.then((response) => response.json())
.then((responseJson) => {
	return responseJson.movies;
}).catch(err=>{

});
// ES7 异步 fetch
async function getApi() {
  try {
    // 注意这里的await语句，其所在的函数必须有async关键字声明
    let response = await fetch(
      'https://facebook.github.io/react-native/movies.json',
    );
    let responseJson = await response.json();
    return responseJson.movies;
  } catch (error) {
    console.error(error);
  }
}

//-------------------------WebSocket
var ws = new WebSocket('ws://host.com/path');
ws.onopen = () => {
  // connection opened
  ws.send('something'); // send a message
};
ws.onmessage = (e) => {
  // a message was received
  console.log(e.data);
};
ws.onerror = (e) => {
  // an error occurred
  console.log(e.message);
};
ws.onclose = (e) => {
  // connection closed
  console.log(e.code, e.reason);
};