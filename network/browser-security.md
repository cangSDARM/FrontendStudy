- [**浏览器**同源策略](#浏览器同源策略)
  - [跨域读取同一浏览器内容(cookie、localStorage 等)](#跨域读取同一浏览器内容cookielocalstorage-等)
  - [跨域读取请求](#跨域读取请求)
    - [jsonp: json + padding](#jsonp-json--padding)
    - [CORS](#cors)
    - [简单请求](#简单请求)
    - [CORS 处理](#cors-处理)
- [浏览器恶意网站管理](#浏览器恶意网站管理)
- [内容安全策略(CSP)](#内容安全策略csp)

## **浏览器**同源策略

[参考](https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy)

> 域名, 端口, 协议相同.<br/>
> 不同源的客户端脚本未授权时不可以访问服务器资源(是浏览器限制，非浏览器环境无该限制) <br/>

### 跨域读取同一浏览器内容(cookie、localStorage 等)

1. 只有子域名不同：
   - 配置`document.domain`跨子域(iframe 和父窗口之间)
2. 同一标签页不同的页面(不同时间、iframe 等)：
   - 配置`window.name`跨域
3. ifame
   - 使用`postMessage`

```js
window.onload = function () {
  //主窗口发送
  window.frames[0].postMessage("message", "http://lslib.com");
};
window.addEventListener(
  "message",
  function (e) {
    //iframe接收
    if (e.source != window.parent) return;
    var color = container.style.backgroundColor;
    window.parent.postMessage(color, "*");
  },
  false,
);
```

### 跨域读取请求

#### jsonp: json + padding

> 前提条件: script 的 src 属性可以跨域

是一种通过`<script>`加载 JSON 响应的模式.

1. 前端使用`<script>`访问请求一个 js 文件, 等文件加载完后自动执行.
2. 而服务器通过脚本 url 的查询字符串, 将响应封装在回调函数中.
3. 回调函数名是由请求方通过 URL 的查询字符串提供的. 这个回调函数被称作填充, 即 JSONP 的 P

##### 缺点

1. JSONP 只能使用 GET 请求; 提交的数据量受 URL 最大长度限制
2. JSONP 缺乏错误处理机制; 调用失败无任何响应, 只能前端设置超时检测处理
3. JSONP 可能被进行跨站请求伪造(CSRF)攻击;
4. JSONP 响应总是异步的; 没法改成同步阻塞;

> 封装

```js
//前端:
function addScript(scr) {
  //添加<script>标签
  var script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  console.log(script.src); //获取域名, 端口和协议
  document.body.appendChild(script);
}
window.onload = function () {
  //发送JSONP请求
  addScript("https://127.0.0.1:8000/index?callback=fetch"); //如果有要求, 通过GET发送, 且只能发送GET请求
};
function fetch(arg) {} //调用数据函数
```

```py
#后端:
    def fun(req):
        func = req.GET.get("callback", None)
        data = ""
        return HttpResponse("%s(%s)"%(func,data))   #调用前端要求的callback函数
```

#### CORS

Cross-Origin Resource Sharing

##### 步骤

1. 简单请求无 CORS 需求
2. 发起跨域请求时, 引入额外的 Origin 头信息指定请求的源.<br>
   `Origin: http://request.com/`
3. 服务器检查头信息, 确定是否接收. 请求若被接收, 将返回 Access-Control-Allow-Origin 的头(值与 Origin 相同)<br>
   `Access-Control-Allow-Origin: http://request.com/`
4. 接收响应时, 浏览器检查 ACAO 头的值, 若与请求头中 Origin 的值不匹配, 则禁止该请求

#### 简单请求

同时满足：

- [x] Method: `Get`、`POST`、`HEAD`
- [x] 没有: `Accept*`、`Content-Language`、`Cotent-Type`
  - 如果有`Content-Type`，只允许：text/plain、multipart/form-data
    、application/x-www-form-urlencoded
- [x] 请求中没有使用 `ReadableStream` 对象

#### CORS 处理

|        后端理解        |         后端反对         |
| :--------------------: | :----------------------: |
| 协商设置正确的 ACAO 头 | 第三方代理服务器代理请求 |

## 浏览器恶意网站管理

[PhishTank 是互联网免费提供恶意网站黑名单的组织之一](https://phishtank.org/index.php)

## 内容安全策略(CSP)

CSP 头允许 S 端配置哪些资源(JavaScript, CSS, Images, etc.)可以被加载，以及哪些资源提供商的 URL 是安全的

[具体细节](https://content-security-policy.com/)

[安全测试](https://securityheaders.com/)

例子：
```
Content-Security-Policy: allow 'self'; img-src *; media-src qq.com; script-src test.com
# 浏览器除了信任自身来源外，还可以加载任意域的图片、来自qq.com的媒体文件和来自test.com的脚本，其他的一律拒绝
```
