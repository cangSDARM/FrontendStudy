FIDO(Fast Identity Online)联盟定义的, 用于硬件、生物或软件进行加解密的 Web API 集合
可用于公私钥加密系统(pubkey)、普通用户名密码系统(password)及联邦学习加密系统(federated)

公私钥加密系统步骤:

1. 注意
   - 挑战必须在 Server 端生成的随机 buffer(至少 16 Bytes)，以确保安全
   - 挑战必须一次性，防止重放攻击
   - rpId 必须在注册和登录期间不变
   - Server 至少需要支持公私钥加密才能使用 WebAuthn
2. 用户选择 Client 的**仪式(ceremony, 注册或登录)**
3. Client 发送仪式请求到 Server
4. Server 返回对应的用户信息、**RP 信息(Relying Party, 即 Web App 的 Server + Client)**以及一次性**挑战(challenge)**
5. Client 调用对应的浏览器 API, 浏览器/用户唤起验证器
6. 验证器私钥签名, 用户输入(可选)并返回给 Client API
7. Client 将浏览器结果发送给 Server
8. Server 验证用户拥有身份验证所需要的私钥

## RP

### Server 端

服务器端需要实现: 生成 WebAuthn 仪式的选项、验证响应和存储 PubKey

### Client 端

客户端需要实现: 与服务器通信接收挑战, 调用 WebAuthn API, 并在每个所需的消息格式之间进行转换(id 和 challenge 需要是 ArrayBuffer)。

### 注册

```ts
const convertX2ArrayBuffer = () => {}; // 将 Server 的数据转为 ArrayBuffer
const challengeReq = await fetch("/registration/gen-challenge"); // Server 生成注册需要的 option
const options = {
  // publicKey / password / federated 只能选一种
  publicKey: {
    rp: {
      id: "example.com",
      name: "EXAMPLE COM",
    },
    user: {
      id: convertX2ArrayBuffer(challengeReq.id),
      name: "me@example.com",
      displayName: "Chrome Touch ID",
    },
    // 一次性, 用于防止重放攻击
    challenge: convertX2ArrayBuffer(challengeReq.challenge),
    // ...
  },
};
navigator.credentials
  .create(options)
  .then(function (credential) {
    if (credential instanceof PublicKeyCredential) {
      // Send credential info to server, mainly the id (pubkey)
      console.log({
        //新生成的凭证的ID(公钥);它将用于在认证用户时标识凭证。ID是一个base64编码的字符串
        id: credential.id,
        // id 的 ArrayBuffer 形式(防止前端转换错误, 测试用)
        rawId: credential.rawId,
        // 这表示从身份验证器返回到浏览器的数据, 以便将新凭据与身份验证器和浏览器相关联
        response: credential.response,
        // 表示该验证器是可移动的(cross-platform)或不可移动的(platform)
        authenticatorAttachment: credential.authenticatorAttachment,
      });
    } else if (credential instanceof FederatedCredential) {
    } else if (credential instanceof PasswordCredential) {
    } else {
      throw "unknown credential type";
    }
  })
  .catch(function (err) {
    // No acceptable authenticator or user refused consent
  });
```

### 登录

```ts
const convertX2ArrayBuffer = () => {}; // 将 Server 的数据转为 ArrayBuffer
const challengeReq = await fetch("/login/gen-challenge"); // Server 生成登录需要的 option
const options = {
  publicKey: {
    id: "example.com",
    challenge: convertX2ArrayBuffer(challengeReq.challenge),
    userVerification: "preferred",
    allowCredentials: [
      {
        type: "public-key",
        id: convertX2ArrayBuffer(challengeReq.pubkey),
        transports: ["usb", "nfc", "ble"],
      },
    ],
  },
};
navigator.credentials
  .get(options)
  .then(function (assertion) {
    // assertion 和 credential 类似，但不包括公钥(options里id就是)
    // Send authentication status to server
  })
  .catch(function (err) {
    // No acceptable passkey or user refused consent
  });
```
