(function(e){
    let il = Array.from(document.body.children, item=>item, window);
    for(let i in il){
        document.body.removeChild(il[i]);
    }
})();
var ws = new WebSocket("ws://echo.websocket.org/echo");
ws.open = function(){}
ws.onmessage = function(e){
    const blob = e.data;
    console.log("message: ", blob.size, "bytes");
    if(window.webkitURL){ URL = webkitURL; }
    let uri = URL.createObjectURL(blob);
    let img = document.createElement("img");
    img.src = uri;
    document.body.appendChild(img);
}
//handle drop event
document.ondrop = function(e){
    document.body.style.backgroundColor = "#fff";
    try{
        e.preventDefault();
        handleFileDrop(e.dataTransfer.files[0]);
        return false;
    } catch(err){
        console.debug(err);
    }
}
//Provide visual feedback for the drop area
document.ondragover = function(e){
    e.preventDefault();
    document.body.style.backgroundColor = "#6fff41";
}
document.ondragleave = function(e){
    document.body.style.backgroundColor = "#fff";
}
//Read binary file contents and send them over WebSocket
function handleFileDrop(file){
    let reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function(){
        console.log("sending: ", file.name);
        ws.send(reader.result);
    }
}