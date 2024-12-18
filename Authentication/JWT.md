- [JWK](#jwk)
  - [钥匙串](#钥匙串)
- [JWT](#jwt)
  - [通用结构](#通用结构)
    - [Header](#header)
    - [Payload](#payload)
    - [Signature](#signature)
  - [使用方式](#使用方式)
  - [验证方式](#验证方式)
- [JWS](#jws)
  - [钥匙链(多次签名)](#钥匙链多次签名)

## JWK

JSON Web Key, 用于[以 JSON 形式表示加密密钥](https://datatracker.ietf.org/doc/html/rfc7517)

```json
{
  "kty": "RSA",
  "use": "sig",
  "alg": "RS256",
  "n": "0vx7agoebGcQSuuPiLJXZpt...-TmV4HCA1T8jXg3fE2VbA",
  "e": "AQAB",
  "kid": "2011-04-29-1234"
}
```

一些常见属性:

- kty (Key Type): 使用密钥的加密算法家族。常见值包括 RSA、EC 和 oct。在 RFC 7518 中，EC 被标记为“推荐+”。
- use (Public Key Use): 公钥的预期用途。常见值包括 sig (签名) 和 enc (加密)。
- key_ops (Key Operations): 密钥支持的操作。常见值包括 sign、verify、encrypt 和 decrypt。
- alg (Algorithm): 预期使用该密钥的算法。根据密钥类型，算法可能会有所不同。例如，RS256 可能用于 RSA 密钥，而 ES256 可能用于 EC 密钥。
- kid (Key ID): 密钥的唯一标识符。它可以用于在一组密钥中匹配一个特定的密钥

### 钥匙串

当需要将多个 JWK 组合在一起时，它们会被组织成一个 JSON Web Key Set (JWKS)

```json
{
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "alg": "RS256",
      "n": "0vx7agoebGcQSuuPiLJXZpt...-TmV4HCA1T8jXg3fE2VbA",
      "e": "AQAB",
      "kid": "2011-04-29-1234"
    },
    {
      "kty": "EC",
      "crv": "P-384",
      "x": "F_xQdbOho2Jw0hgmNPD0VAEPAgkQrfD4f1Qx3y49cUm646fMBX9DYx-43HzXm6Vd",
      "y": "X77uFymz90aO4dBunpTdUzLFRAiT7-IngzZGDrIE-FG6CcqQuRP65r65SUzDOmP5"
    }
  ]
}
```

## JWT

JSON Web Token, 用于提供一个标准化的方法来表示 JSON 对象及其签名

JWT 仅提供校验，不提供**加密**. 因此内容可以自行解析

为便于扩展并广泛实现, JWT 有以下的标准

### 通用结构

`Header.Payload.Signature`

每个结构都是一个以 [Base64URL](https://base64.guru/standards/base64url/decode) 编码的 JSON 对象，每个部分之间用`.`分隔

#### Header

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

`alg` 表示签名的算法，默认是 HMAC SHA256
`typ` 表示这个令牌的类型，JWT 令牌统一写为 JWT

#### Payload

随便定义, 但官方有 7 个可选的预定义好的字段:

- `iss` (issuer)：签发人
- `exp` (expiration time)：过期时间
- `sub` (subject)：主题
- `aud` (audience)：受众
- `nbf` (Not Before)：生效时间
- `iat` (Issued At)：签发时间
- `jti` (JWT ID)：编号

可以在这个部分定义私有字段

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true
}
```

#### Signature

是对前两部分的签名，防止数据篡改。

Server 首先指定一个 secret，然后使用：
`Header.alg(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)`，算出 Signature

### 使用方式

1. Server 验证用户后, 将所需要的数据放在 Payload 里算出 JWT
2. Client 收到 JWT, 可以储存在 Cookie 里面, 也可以储存在 localStorage。
3. 此后，Client 每次需要加密通信时, 都要带上这个 JWT.

- 可以把它放 Cookie 里自动发送，但是这样不能跨域
- 或者放在 HTTP 请求的头信息 Authorization 字段里面(`"Bearer"+jwtStr`)
- 甚至可以在请求时放进 Body/Params 里

### 验证方式

1. 使用 . 分隔符将 JWT 分为三部分(头部、载荷和签名)
2. 使用 Base64URL 解码头部和载荷
3. 使用头部中指定的算法和公钥(对于非对称算法)验证签名

## JWS

JSON Web Signature, 单次签名时特指 JWT 中 Signature 这个步骤

JWT 没有 JWS 辅助时, 称为 nonsecure JWT

### 钥匙链(多次签名)

```json5
{
  // Base64URL 编码的有效载荷。这是要签署的数据
  payload: "{{payload}}",
  signatures: [
    {
      // Base64URL 编码的 header( JWT 中的 header), 所有 protected 中的值是一样的
      protected: "{{protected-header}}",
      // JWS 额外的 header, 不包含在签名中
      header: "{{header}}",
      // 对当前 protected+payload 的签名
      signature: "{{signature}}",
    },
    {
      protected: "{{protected-header}}",
      header: "{{header}}",
      signature: "{{signature}}",
    },
    // ...
  ],
}
```

JWS 额外 header 中有 9 个可选的预定义好的字段:

- jku: 发送 JWK 的地址; 最好用 HTTPS 来传输
- jwk: 即 JWK
- kid: ID 编号
- x5u: 指向一组 X509 公共证书的 URL
- x5c: X509 证书链
- x5t: X509 证书的 SHA-1 指纹
- x5t#S256: X509 证书的 SHA-256 指纹
- typ: 在原本未加密的 JWT 的基础上增加了 JOSE 和 JOSE + JSON. 适用于 JOSE 标头的对象与此 JWT 混合的情况
- crit: 字符串数组，包含声明的名称，用作实现定义的扩展，必须由 this->JWT 的解析器处理. 不常见
