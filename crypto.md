- [硬件随机](#硬件随机)
- [哈希](#哈希)
- [签名](#签名)
- [摘要](#摘要)
- [验证](#验证)
- [加密](#加密)
- [另外支持](#另外支持)

## 硬件随机
```js
const twentyBytes = crypto.getRandomValues(new Uint8Array(20));
```

## 哈希

```js
async function digestMessage(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return hash;
}
```

## 签名

```js
const encoder = new TextEncoder();
const message = encoder.encode('Hello world!');
let signature = await window.crypto.subtle.sign(
  "HMAC",
  privateKey,
  message
);
```

## 摘要

```js
async function digestMessage(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return hash;
}
```

## 验证

```js
async function verifyMessage(publicKey) {
  const signatureValue = document.querySelector(
    ".rsassa-pkcs1 .signature-value"
  );
  signatureValue.classList.remove("valid", "invalid");

  let encoded = getMessageEncoding();
  let result = await window.crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    signature,
    encoded
  );

  signatureValue.classList.add(result ? "valid" : "invalid");
}
```


## 加密

```js
const key = await crypto.subtle.generateKey(
  // The algorithm is AES in CBC mode, with a key length
  // of 256 bits.
  {
    name: 'AES-CBC',
    length: 256
  },
  // Allow extracting the key material (see below).
  true,
  // Restrict usage of this key to encryption.
  ['encrypt']
);

// AES-CBC requires a 128-bit initialization vector (iv).
const iv = crypto.getRandomValues(new Uint8Array(16));

// This is the plaintext:
const encoder = new TextEncoder();
const message = encoder.encode('Hello world!');

// Finally, encrypt the plaintext, and obtain the ciphertext.
const ciphertext = await crypto.subtle.encrypt(
  // The algorithm is still AES-CBC. In addition, the
  // 128-bit initialization vector must be specified.
  {
    name: 'AES-CBC',
    iv
  },
  // The encryption key. This must be an AES-CBC key,
  // otherwise, this function will reject.
  key,
  // The plaintext to encrypt.
  message
);
```

## 另外支持
密钥派生(deriveKey)、密钥导入/导出(importKey/exportKey)、密钥Wrap/Unwrap(wrapKey/unwrapKey)
