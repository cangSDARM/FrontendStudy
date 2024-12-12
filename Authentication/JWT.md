- [通用结构:](#通用结构)
  - [Header](#header)
  - [Payload](#payload)
  - [Signature](#signature)
- [使用方式](#使用方式)

JWT 的原理是，服务器认证以后，生成用户验证信息，之后服务器只需要拿到加密的字串与服务器签名验证即可。

JWT 仅提供校验，不提供**加密**。因此内容可以自行解析

为便于扩展并广泛实现，JWT 有以下的标准

## 通用结构:

`Header.Payload.Signature`

每个结构都是一个以 [Base64URL](https://base64.guru/standards/base64url/decode) 编码的 JSON 对象，每个部分之间用`.`分隔

### Header

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

`alg` 表示签名的算法，默认是 HMAC SHA256
`typ` 表示这个令牌的类型，JWT 令牌统一写为 JWT

### Payload

官方**可选的**字段有 7 个:
`iss` (issuer)：签发人
`exp` (expiration time)：过期时间
`sub` (subject)：主题
`aud` (audience)：受众
`nbf` (Not Before)：生效时间
`iat` (Issued At)：签发时间
`jti` (JWT ID)：编号

可以在这个部分定义私有字段

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true
}
```

### Signature

是对前两部分的签名，防止数据篡改。

服务器首先指定一个 secret，然后使用：
`Header.alg(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)`，算出 Signature

## 使用方式

客户端收到服务器返回的 JWT，可以储存在 Cookie 里面，也可以储存在 localStorage。

此后，客户端每次与服务器通信，都要带上这个 JWT。可以把它放 Cookie 里自动发送，但是这样不能跨域，或者放在 HTTP 请求的头信息 Authorization 字段里面(`"Bearer"+jwtStr`)。甚至可以在请求时放进 Body/Params 里
