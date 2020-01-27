### 纹理映射的示例程序

```js
var VSHADER = ...`
	attribute vec4 a_Pos;
	attribute vec2 a_TexCoord;
	varying vec2 v_TexCoord;
	void main(){
		gl_Position = a_Pos;
		v_TexCoord = a_TexCoord;
	}
`;	//顶点着色器接受顶点的纹理坐标, 光栅化后传递给片元着色器

var FSHADER = ...`
	uniform sampler2D u_Samp;
	varying vec2 v_TexCoord;
	void main(){
		gl_FragColor = texture2D(u_Samp, v_TexCoord);
	}
`;	//片元着色器通过片元的纹理坐标, 从纹理图像中抽取出纹素颜色, 赋值给当前片元

function main(){
	...
	//设置顶点信息
	var n = initVertexBuffers(gl);
	...
	//配置纹理
	if(!initTextures(gl, n)){
		...
	}
}	//设置顶点的纹理坐标

function initVertexBuffers(gl){
	var verticesTexCoords = new Float32Array({
		//顶点坐标，纹理坐标
		-0.5, 0.5, 0.0, 1.0,
		-0.5, -0.5, 0.0, 0.0,
		0.5, 0.5, 1.0, 1.0,
		0.5, -0.5, 1.0, 0.0,
	});
	var n = 4;	//顶点数目

	//创建缓冲区对象
	var vertexTexCoordBuffer = gl.createBuffer();
	...

	//将顶点坐标和纹理坐标写入缓冲区对象
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

	var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
	...
	gl.vertexAttribPointer(a_Pos, 2, gl.FLOAT, false, FSIZE*4, 0);
	gl.enableVertexAttribArray(a_Pos);	//Enable buffer allocation
	//将纹理坐标分配给a_TexCoord并开启
	var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
	...
	gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE*4, FSIZE*2);
	gl.enableVertexAttribArray(a_TexCoord);
	...
	return n;
}	//设置顶点的纹理坐标

function initTextures(gl, n) {
	var texture = gl.createTexture();	//创建纹理对象
	...
	//获取u_Samp存储位置
	var u_Samp = gl.getUniformLocation(gl.program, 'u_Samp');
	...
	var image = new Image();
	image.onload = function() {
		loadTexture(gl, n, texture, u_Samp, image);
	}
	image.src = '/resources/sky.png';
	return true;
}	//准备加载的纹理图像, 令浏览器读取

function loadTexture(gl, n, texture, samp, image) {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);	//对纹理y轴翻转
	//开启0号纹理单元, 使用前需要开启
	gl.activeTexture(gl.TEXTURE0);	// until TEXTURE7
	//向target绑定对象
	gl.bindTexture(gl.TEXTURE_2D, texture);
	//配置纹理参数
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	//配置纹理图像
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
	//将0号图像传递给着色器中的samp变量
	gl.uniform1i(samp, 0);
	...
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);	//绘制矩形
}	//监听纹理的加载事件, 一旦加载完成及使用纹理

```