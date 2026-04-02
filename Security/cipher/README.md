- [随机数](#随机数)
  - [UUID](#uuid)
- [对称加密](#对称加密)
  - [分组加密](#分组加密)
  - [流密码](#流密码)
  - [代表](#代表)
    - [FPE](#fpe)
- [非对称加密](#非对称加密)
- [消息认证和散列](#消息认证和散列)
  - [消息认证码 MAC](#消息认证码-mac)
  - [消息摘要 HASH](#消息摘要-hash)
    - [签名](#签名)
    - [安全散列](#安全散列)
  - [带密钥散列 HMAC](#带密钥散列-hmac)
- [实例](#实例)
  - [JOSE: JWT/JWS/JWE/JWK](#jose-jwtjwsjwejwk)
- [编程语言](#编程语言)
  - [js](#js)

## 随机数

密码学要求(截然不同且不一定兼容)随机数

- 随机性
  - 判断随机性有两条准则
    - 分布随机性 uniform distribution 序列中每个随机数出现频率大致相等
    - 独立性 independence 序列中任何数不能由其他数推导出来(无法证明，只能测试直到认为足够强)
- 不可预测性
  - 已知序列中前面的所有随机数，也无法预测出下一个
  - 独立不一定可预测(钳位/随机种子等情况)，但不可预测一定独立

### [UUID](./identifier.md)

## 对称加密

### 分组加密

block cipher, 是将定长的明文转为等长的密文。更长的明文需要分组加密

代表有

- DES/DEA
- 3DES(重复DES 3次)
- AES
- SM4
- Camellia
- present
- PRINCE

操作模式

- 电子源码书(ECB)：明文 -> 分组分别用相同算法-密钥加密 -> 简单合并 -> 密文
  - 用结构特征破译

### 流密码

stream cipher, 是将明文逐位/逐字节与密钥流进行逐位异或(XOR)操作来生成密文，解密时用相同密钥流再次异或即可还原明文。
根据密钥流的生成方式，分为同步流密码(密钥流独立于明文/密文，最主流)和自同步流密码(密钥流依赖前序密文)

密钥流(keystream)由伪随机发生器(不知道密钥情况下不可预知的伪随机)产生

### 代表

- RC4
- A5/1 & A5/2
- Salsa20
- ChaCha20
- Grain-128a

#### FPE

Format-Preserved Encryption, 格式保留加密。
保证输入输出具有相同的结构，允许等价的排序搜索等。常见于数据库/脱敏

## 非对称加密

非对称加密有两种方式：

- 公钥加密、私钥解密(机密性)
- 私钥加密、公钥解密(认证和数据完整性)

算法要求：

1. 产生一对密钥(公钥$PU$，私钥$PR$)计算上是容易的
2. 已知公钥和消息，发送方产生密文应容易实现$C=E(PU, M)$
3. 接收方使用其私钥对密文解密是实现的$M=D(PR,C)=D[PR,E(PU, M)]$
4. 已知公钥时，攻击者确定私钥是计算上不可行的
5. 已知公钥和密文，攻击者恢复明文是计算上不可行的
6. 加密和解密的函数可以交换$M=D[PU,E(PR,M)]=D[PR,E(PU,M)]$

代表有

- RSA
- Diffie-Hellman。只限于密钥分发
- DSS。只提供数字签名功能，不能用于加密和密钥分发
- 椭圆曲线

由于公钥分发可以被伪造，因此需要认证中心(CA)进行证书授信；或通过信任网(Web of Trust)，去中心化互相签名实现。
X.509 是用来格式化证书的公共标准

## 消息认证和散列

允许通信者验证接受的消息是否被篡改/可信、时效性和相对顺序

### 消息认证码 MAC

是关于消息和密码的复杂函数，$MAC=F(K, M)$

- 接收方利用类似函数计算并验证
- 由于接收方和发送方都可以计算出相同MAC，因此无法追溯签名者

代表有

- CBC-MAC
- AES-GCM
- CMAC

### 消息摘要 HASH

(散列)是关于消息的复杂函数，$H=F(M)$

代表有

- MD5
- SHA-1 & SHA-256 & SHA-3
- SM3

#### 签名

摘要通常会再用私钥进行加密(即签名)，然后随消息发出。

- 接收方利用公钥进行解密，然后通过函数计算并验证
- 签名使用非对称，因此可以追溯签名者

#### 安全散列

必须支持(前三个是必须满足)：

1. $H$可用于任意长度数据块
2. $H$需产生固定长度输出
3. 对于任意给定$x$，计算$H(x)$应较为容易，用软硬件均可实现
4. 对任意给定的散列结果$h$，找到$H(x)=h$的$x$在计算上应不可行
   - 满足该条件的称为单向(one-way)或抗原象(preimage resistant)
   - 暴力攻击难度$2^n$
5. 对于任意给定$x$，找到满足$y\neq x$且$H(y)=H(x)$的$y$在计算上是不可行的
   - 满足该条件的称为第二抗原象(second preimage resistant)或弱抗碰撞(weak collision resistant)
   - 可以保证不能找到与给定消息相同的另一条消息，防止伪造
   - 暴力攻击难度$2^n$
6. 找到任何满足$H(x)=H(y)$的偶对$(x,y)$在计算上是不可行的
   - 满足该条件的称为(强)抗碰撞(strong collision resistant)
   - 可以阻止伪造已签名的消息
   - 暴力攻击难度$2^{n/2}$

### 带密钥散列 HMAC

连接($\|$)密钥和消息为$MD=(K_1\|M\|K_2)$，发送$M\|MD$。好处是不需要再进行加密

- 接收方利用密钥重新计算并验证

代表有

- HMAC
- Poly1305

## 实例

### [JOSE: JWT/JWS/JWE/JWK](./JOSE.md)

## 编程语言

### js

```js
// 硬件随机
const twentyBytes = crypto.getRandomValues(new Uint8Array(20));

// 签名
const encoder = new TextEncoder();
const message = encoder.encode("Hello world!");
const signature = await window.crypto.subtle.sign("HMAC", privateKey, message);

// 摘要
async function digestMessage(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return hash;
}

// 加密
const key = await crypto.subtle.generateKey(
  // The algorithm is AES in CBC mode, with a key length
  // of 256 bits.
  {
    name: "AES-CBC",
    length: 256,
  },
  // Allow extracting the key material (see below).
  true,
  // Restrict usage of this key to encryption.
  ["encrypt"],
);
// AES-CBC requires a 128-bit initialization vector (iv).
const iv = crypto.getRandomValues(new Uint8Array(16));
// This is the plaintext:
const encoder = new TextEncoder();
const message = encoder.encode("Hello world!");
// Finally, encrypt the plaintext, and obtain the ciphertext.
const ciphertext = await crypto.subtle.encrypt(
  // The algorithm is still AES-CBC. In addition, the
  // 128-bit initialization vector must be specified.
  {
    name: "AES-CBC",
    iv,
  },
  // The encryption key. This must be an AES-CBC key,
  // otherwise, this function will reject.
  key,
  // The plaintext to encrypt.
  message,
);

// 验证
async function verifyMessage(publicKey) {
  const signatureValue = document.querySelector(
    ".rsassa-pkcs1 .signature-value",
  );
  signatureValue.classList.remove("valid", "invalid");

  let encoded = getMessageEncoding();
  let result = await window.crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    signature,
    encoded,
  );

  signatureValue.classList.add(result ? "valid" : "invalid");
}

// 另外支持
// 密钥派生(deriveKey)、密钥导入/导出(importKey/exportKey)、密钥 Wrap/Unwrap(wrapKey/unwrapKey)
```
