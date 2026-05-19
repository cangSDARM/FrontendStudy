- [随机数](#随机数)
  - [UUID/Snowflake](#uuidsnowflake)
- [密码分析](#密码分析)
- [对称加密](#对称加密)
  - [分组加密](#分组加密)
    - [加密模式](#加密模式)
    - [代换置换](#代换置换)
    - [SPN 结构](#spn-结构)
    - [Feistel 结构](#feistel-结构)
    - [代表](#代表)
  - [流密码](#流密码)
    - [代表](#代表-1)
  - [FPE](#fpe)
- [非对称加密](#非对称加密)
- [哈希函数](#哈希函数)
  - [非密码学](#非密码学)
  - [安全散列](#安全散列)
    - [Merkle–Damgård 结构](#merkledamgård-结构)
    - [代表](#代表-2)
  - [消息摘要](#消息摘要)
  - [签名](#签名)
- [消息认证码 MAC](#消息认证码-mac)
  - [带密钥散列 HMAC](#带密钥散列-hmac)
- [实例](#实例)
  - [混合公钥加密 HPKE](#混合公钥加密-hpke)
    - [带关联数据的任证加密 AEAD](#带关联数据的任证加密-aead)
  - [JOSE: JWT/JWS/JWE/JWK](#jose-jwtjwsjwejwk)
- [编程语言](#编程语言)
  - [js](#js)

原则

- 柯克霍夫原则: **一个密码系统的安全性不应依赖于算法的保密，而应仅依赖于密钥的保密**。即哪怕攻击者完全掌握了你的加密算法、源代码等除了密钥之外的一切信息，系统也必须保持安全

## 随机数

密码学要求(截然不同且不一定兼容)随机数

- 随机性
  - 判断随机性有两条准则
    - 分布随机性 uniform distribution 序列中每个随机数出现频率大致相等
    - 独立性 independence 序列中任何数不能由其他数推导出来(无法证明，只能测试直到认为足够强)
- 不可预测性
  - 已知序列中前面的所有随机数，也无法预测出下一个
  - 独立不一定可预测(钳位/随机种子等情况)，但不可预测一定独立

### [UUID/Snowflake](./identifier.md)

## [密码分析](../threat.md#密码分析)

## 对称加密

### 分组加密

block cipher, 是将定长的明文转为等长的密文。更长的明文需要分组加密

操作模式

- 电子源码书(ECB)：明文 -> 分组分别用相同算法-密钥加密 -> 简单合并 -> 密文
  - 用结构特征破译

#### 加密模式

分组密码算法只能加密固定长度的分组，对分组更长的明文迭代的方式就称为分组密码的加密模式

1. ECB：Electronic Codebook(电子密码本模式)
   - 每个块独立加密，无关联性
   - 相同明文块生成相同密文块
   - 密文块按原顺序拼接
2. CBC：Cipher Block Chaining(密码块链模式)
   - 第一块明文先与“初始化向量(IV)”异或再加密；之后每一块明文，都先与前一块密文异或再加密
   - IV 必须随机且唯一
   - 不防篡改。篡改一个密文块的比特，能精确控制下一个明文块的对应位翻转(字节翻转攻击)，并影响下下一个块
   - 易受选择明文攻击，如 TLS 1.0 的 BEAST 攻击
3. CFB：Cipher Feedback(密码反馈模式)
   - 与 CBC 类似，但它是先加密IV或前一块密文当成密钥流，生成密钥后与明文异或
   - 密钥流生成是使用移位寄存器(只取最左边的 n 个字节异或，把刚生成的密文塞入寄存器最右边)
   - 流模式使得其绕过了填充问题，可以处理不定长明文
   - IV 必须唯一且随机，否则会导致密钥流重复
   - 由于移位寄存器存在，使得错误影响范围不再是两块分块，而是一块+流寄存器长
4. OFB：Output Feedback(输出反馈模式)
   - 反复加密 IV，预先算好一大串密钥流($R_1=E(IV), R_2=E(R_1) ... R_n=E(R_{n-1})$)，然后和明文/密文异或
   - 比特错误不扩散，密文中一个比特错误，解密后对应的只有一个比特出错。抗字节翻转攻击
   - 但比特丢失/增多会导致灾难性错位
5. CTR：Counter(计数器模式)
   - 对不断递增的计数器(Counter)+Nonce加密，生成“密钥流”，再和明文/密文做异或(XOR)
   - 密钥流生成仅是计数器简单递增
   - 支持并行加密/解密
   - Nonce 重用会暴露两份明文的异或
   - 不防篡改。篡改一个密文块的比特，能精确控制下一个明文块的对应位翻转(字节翻转攻击)
6. GCM：Galois/Counter Mode(伽罗瓦/计数器模式)
   - 属于 AEAD
   - 加密用 CTR，同时把密文和附加数据使用 GHASH 生成认证标签。解密前会先验证标签，若不匹配直接拒绝
     - GHASH 的密钥由双方通过主密钥 K 本地算出，从不通过网络传输。密码算法的伪随机置换(PRP)保证 K -> H 无法被逆转或预测
   - Nonce 重用不但会暴露两份明文的异或，还能直接恢复出 GHASH 认证密钥，导致此后所有认证标签永久失效
   - GCM 模式的 Nonce 强制 96 位，这个规定与底层用 AES-128 还是 AES-256 无关
   - CTR 加密和 GHASH 认证可以完美并行，硬件可实现极高吞吐量(如 AES-NI 指令加速)
7. CCM：Counter with CBC-MAC(计数器与CBC-MAC模式)
   - 属于 AEAD
   - 加密用 CTR，任证标签使用 CBC-MAC
   - 加密和认证是两个独立步骤，必须先计算标签再执行加密，无法流水线并行，速度较慢
   - Nonce 重用会暴露两份明文的异或，但 CBC-MAC 认证密钥并未泄露。标签的安全性依然依赖于密钥，灾难被限制在加密部分

注意，CTR、CFB、OFB 等核心是生成密钥流，密钥流均通过加密函数生成。
解密只需用密钥流和密文异或，全程不用解密函数

- 禁用名单：ECB(极易受已知明文攻击)、CBC/OFB(不防篡改)、CFB(不防篡改，虽然防错误扩散，但它的错误恢复实际上可由上层协议处理，不是很有必要)
- 可用但不完美：CTR(速度快，需解决完整性)
- 现代首选：GCM、CCM

##### 填充

|     方式     | 规则                                                                            | 特点                                       |
| :----------: | :------------------------------------------------------------------------------ | :----------------------------------------- |
|  ISO 10126   | 最后一个字节为填充长度，其余填充随机数                                          | 已废弃                                     |
|  ANSI X9.23  | 最后一个字节为填充长度，其余填充 0                                              | 已废弃                                     |
| Zero Padding | 填充 0x00                                                                       | 有问题：无法区分数据末尾的自然 0x00 与填充 |
|  NoPadding   | 不填充                                                                          | 需要上层协议保证长度已是整数倍             |
|   PKCS\#7    | 若需填充 n 个字节，则每个字节的值都填 n；n 的范围是 1 到 分组长度(如 AES 为 16) | Padding Oracle Attack                      |

#### 代换置换

一个好的对称密码应该通过混淆(Confusion，通常用代换实现)和扩散(Diffusion，通常用置换实现)来抵抗统计分析和已知明文攻击

- 代换：把明文中的元素（字母、比特）映射成密文中的另一个元素。比如把“A”换成“D”
- 置换：不改变元素本身，只打乱它们的位置。比如把“HELLO”重排成“OLLEH”

分组密钥中，代换单元称为 S盒(Substitution-Box)，置换单元称为 P盒(Permutation-Box)

#### SPN 结构

Substitution Permutation Network, 会在每一轮都把整个数据块都通过代换和置换“搅拌”一遍

每一轮 SPN 通常包含三个标准操作

- 轮密钥加：将当前数据块与这一轮的轮密钥执行异或(XOR)运算
- 代换：数据被切分成小块，每块都通过 S盒进行处理
- 置换：把代换层组合后，进行 P 盒处理

SPN 的加解密不对称。解密时必须按完全相反的步骤，用专为解密设计的“逆S盒”和“逆P盒”还原回去

#### Feistel 结构

最大的优点是加密和解密可以使用完全相同的硬件/代码逻辑

平衡 Feistel 结构的处理流程

1. 对半分：首先把输入的数据块平分成左($L_0$)、右($R_0$)两半
   - 非平衡的即不平均分
2. 轮函数混淆：新右半的计算方法是 $R_{n+1}=L_n\oplus F(R_n, K_n)$
   - F 是轮函数：在这个“黑盒”里，会执行代换(S盒)和置换(P盒)等混淆操作，配合轮密钥$K_n$加密数据
   - $\oplus$ 是异或运算：核心操作用异或完成，简单高效且可逆
3. 交叉混合：新左半直接复制旧右半($L_{n+1}=R$)
4. 多次迭代：上述过程反复执行十几次，最终将左右两半$L_n, R_n$重新合并输出密文

针对解密，由异或性质($a\oplus b\oplus b=a$)可知，仅需要切换轮密钥输入顺序($K_{n} \longrightarrow K_{n-1} ... K_1$)即可

#### 代表

- DES/DEA
  - 分组长度为 64，密钥长度 56
  - 使用 Feistel 结构处理，共计 16 轮
- 3DES
  - 使用三个密钥重复DES 3 次，密钥长度 $3*56=168$ 位，有效位 112 位[^3des_3key_valid_length]
  - 加密(EDE)：DES加密 -> DES解密 -> DES加密
  - 解密(DED)：DES解密 -> DES加密 -> DES解密
  - 2-key 模式：$K_1=K_3$，密钥总长度为 112 位，有效位 80 位[^3des_2key_valid_length]
- AES
  - 分组长度为 128，密钥长度 128 / 192 / 256
  - 密钥需要通过密钥扩展算法，扩展出来 $4\times(10+1)$ 个 32 位数组
  - 使用 SPN 结构处理，共计 10 轮(192 位需要 12 轮，256 位需要 14 轮)
    - 并在正式开始第 1 轮之前，需要先做一次轮密钥加
    - 动作为: 代换 -> 行移位 -> 列混合 -> 轮密钥加。但最后一轮不包含列混合[^aes_round_action]
    - S 盒单元为 4x4 字节矩阵
    - P 盒包括
      - 行移位(ShiftRows): 将矩阵的每一行循环左移不同字节（第一行不变，第二行移1，第三行移2，第四行移3），打破列对齐
      - 列混合(MixColumns): 将矩阵每一列视为一个多项式，在伽罗瓦域$GF(2^8)$上乘以固定多项式$c(x)=03x^3+01x^2+01x+02$，使每列的4个字节充分混合
- AEGIS
- SM4
- Camellia
- present
- PRINCE

[^3des_3key_valid_length]: 由于中途相遇攻击 (meet-in-the-middle attack)的存在，因此有效位比长度略短

[^3des_2key_valid_length]: 受到 van Oorschot-Wiener 等已知明文攻击的影响

[^aes_round_action]: 因为最后一轮再加 MixColumns 不会增强安全性，反而会使解密器多实现一个逆操作

### 流密码

stream cipher, 是将明文逐位/逐字节与密钥流进行逐位异或(XOR)操作来生成密文，解密时用相同密钥流再次异或即可还原明文。
根据密钥流的生成方式，分为同步流密码(密钥流独立于明文/密文，最主流)和自同步流密码(密钥流依赖前序密文)

密钥流(keystream)由伪随机发生器(不知道密钥情况下不可预知的伪随机)产生

#### 代表

- RC4
  - 分为两个部分。第一部分是密钥调度算法(Key-Scheduling Algorithm), 第二部分是伪随机数生成算法(Pseudo-Random Generation Algorithm)
    - KSA
      - 初始化一个包含 0 到 255 共 256 个字节的数组 `S`，每个数字都唯一
      - 再创建一个临时数组 `T`，并用密钥 `K` 循环填满
      - 遍历 `S` 256 次，每次都用公式 `j = (j + S[i] + T[i]) mod 256` 计算出新位置，交换 `S[i]` 和 `S[j]`。此时，`S` 就被完全打乱了，而这种“乱序”完全取决于密钥
    - PRGA
      - 初始化两个索引 `i` 和 `j` 为 0。对于需要加密的每一个字节，都按固定规则更新：`i = (i + 1) mod 256`，`j = (j + S[i]) mod 256`，然后交换 `S[i]` 和 `S[j]`。这就好比在不停地切牌
      - 计算 `t = (S[i] + S[j]) mod 256`，此时 `S[t]` 这个字节，就是从这副混乱的牌中“发出”的一个密钥流字节
      - 用同样的密钥流字节与明文异或，就能加密；与密文异或，就能解密
  - 由于 RC4 [偏移问题](https://www.anquanke.com/post/id/82792)(一些字节对出现的概率高于其他字节)，因此 RC4 已被证明不安全(CVE-2015-2808)
- A5/1 & A5/2
- Salsa20
- ChaCha20
- Grain-128a

### FPE

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

## 哈希函数

(散列)是关于消息的复杂函数，$H=F(M)$

哈希函数的操作逻辑和对称加密类似。
但和对称加密不同的是，哈希的密钥通常是常量，结构(分块、迭代逻辑)也固化在算法内部

### 非密码学

代表有

- CRC32
- MurmurHash

### 安全散列

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

#### Merkle–Damgård 结构

遵照以下步骤的哈希(逻辑和 CBC 一致):

1. 填充分块:
   - 输入原始消息$M_{in}$、块长度$L$、消息长度限制位$K$
   - 输出先补一个`1`，然后补`0`。直到$M_{out} = n \times L - K$，然后把$M_{in}$写在$K$位里
2. 逐节加工:
   - 输入初始向量(算法写死)$H_0=IV$，分块消息$M_i$，压缩函数$P_i$
   - 输出$H_i = P_i(H_{i-1}, M_i)$

易受长度扩展攻击影响[^length_extend_attack]

[^length_extend_attack]: 允许在不知道密钥内容的情况下，通过已知的散列值和消息长度，构造出新的消息和对应的散列值(夹带)

#### 代表

- MD5
  - Merkle–Damgård 结构、不满足抗碰撞
- SHA-1 & SHA-2/256 & SHA-3
  - SHA-1 产生 160 位散列、不满足抗碰撞
  - SHA-1 和 SHA-2 都是 Merkle–Damgård 结构
- SM3
  - Merkle–Damgård 结构

### 消息摘要

必须是安全散列

- 保证消息完整性

### 签名

消息摘要通常会再用私钥进行加密(即签名)，然后随消息发出。

- 防伪造
- 接收方利用公钥进行解密，然后通过函数计算并验证
- 签名使用非对称，因此可以追溯签名者

## 消息认证码 MAC

Message Authentication Code, 是关于消息和密码的复杂函数，$MAC=F(K, M)$

- 主要防篡改
- 接收方利用类似函数计算并验证
- 由于接收方和发送方都可以计算出相同 MAC，因此无法追溯签名者

代表有

- CBC-MAC
  - 直接用 CBC 模式加密消息，取最后一块密文作为认证码
  - 只在消息长度固定时安全
- CMAC
  - Cipher-based MAC, 实际上只有分组密码通用

### 带密钥散列 HMAC

Hash-based MAC

- 防篡改。比起其他 MAC，更为通用，可以配合其他哈希函数
- 接收方利用密钥重新计算并验证

$HMAC(K, M)=H[(K^+\oplus opad)\|H[(K^+\oplus ipad)\|M]]$，其中:

- $H$: 散列函数(如 SHA/SM)
- $M$: 总的消息
- $b$: 每一分组的位数
- $ipad$: `00110110`(`0x36`) 重复 b/8 次的结果
- $opad$: `01011100`(`0x5C`) 重复 b/8 次的结果
- $K$: 密钥。若密钥长度大于 b，则需要散列密钥使之符合散列目标长度$n$(必须$n\lt b$)
- $K^+$: 若$K$长度短于 b，则在$K$左边填充`0`

## 实例

### 混合公钥加密 HPKE

Hybrid Public Key Encryption:

1. 密钥生成: 用非对称算法分发一把临时对称密钥(主密钥)
2. 密钥派生: 用密钥派生函(KDF)从主密钥派生出一组工作密钥
3. 任证加密: 用派生的密钥来做任证和加密

#### 带关联数据的任证加密 AEAD

Authenticated Encryption with Associated Data, 在一个算法在内部同时实现加密和认证

在 AEAD 成为主流之前，加密和认证是分开的。
如果想让数据既保密又防篡改，就得手动组合。比如选一种加密算法，再选一种 MAC 算法，并且要极其小心地处理两者的顺序和密钥

- 防篡改(加密)
- 防伪造(任证)

代表有

- [AES-GCM](#加密模式)
- ChaCha20-Poly1305

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
