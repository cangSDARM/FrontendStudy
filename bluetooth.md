## 基础

每个蓝牙设备要么是“中央设备”(Central device)或“外围设备”(Peripheral)

- 中央设备
  - 只有中央设备才能启动通信，并且只能与外围设备通信
  - 可以根据需要对消息进行中继
- 外围设备
  - 无法启动通信，只能与中央设备通信
  - 同一时间外围设备只能与一个中央设备通信
  - 外围设备无法与其他外围设备通信

版本关系

| version | release |                                     differ(last gen)                                     |
| :-----: | :-----: | :--------------------------------------------------------------------------------------: |
|   1.0   |  1999   |                                            /                                             |
|   2.0   |  2004   |           Enhanced Data Rate<br/>multiple devices connection<br/>longer range            |
|   2.1   |  2007   |                        Secure Simple Pairing (SSP), the PIN code                         |
|   3.0   |  2009   |     High-Speed (HS), data transfer over Wifi (never used)<br/>Enhanced Power Control     |
|   4.0   |  2010   |                                      Classic & BLE                                       |
|   5.0   |  2016   |                       bandwidth flexibility<br/> Bluetooth codecs                        |
|   5.1   |  2019   |                                    Direction Finding                                     |
|   5.2   |  2020   | LE Audio, Low Complexity Communication Codec (LC3)<br/>audio broadcast(Auracast) support |
|   5.4   |  2023   |                        Periodic Advertising with Responses (PAwR)                        |
|   6.0   |  2024   |                   Bluetooth Channel Sounding, better distance measure                    |

![ble&classic](/assets/bluetooth-versions.png)

## BLE

BLE(Bluetooth Low Energy) 是一种现代规范，除了使用的无线频段相同外，它和旧的蓝牙规范几乎没有任何关系
工作频段: 2400 Mhz ~ 2480 Mhz，0 - 39 个信道，每个信道 2Mhz，
其中 37 (2402 MHz)、38 (2426 MHz)、39 (2480 MHz) 为广播信道 (Advertising Channel)，其余依次为数据信道 (Data Channel)

### 协议栈

```
┌────────────────────────────────────────────────┐
│               Application                      │
├───────────────────────────┬────────────────────┤
│   GAP Role/Sec Profiles   │   GATT Profiles    │  配置文件
├───────────────────────────┴────────────────────┤
│ Host                                           │
│  ┌─────────────────────┬───────────────────────┤
│  │        GAP          │        GATT           │  定义协议结构
│  │   ┌─────────────────┼───────────────────────┤
│  │   │  Sec Manager    │   Attribute Protocol  │  解析
│  │   │    (SM)         │         (ATT)         │
│  │   │   ┌─────────────┴───────────────────────┤
│  │   │   │   Logical Link Control And          │  发送
│  │   │   │   Adaptation Protocol (L2CAP)       │
│  └───┴───┴─────────────────────────────────────┤
├────────────────────────────────────────────────┤
│ Controller                                     │
│  ┌─────────────────────────────────────────────┤
│  │        Host-Controller Interface (HCI)      │
│  ├─────────────────────────────────────────────┤
│  │               Link Layer (LL)               │  RF 控制器，控制设备的射频状态(5个)
│  ├─────────────────────────────────────────────┤
│  │            Physical Layer (PHY)             │  射频调制解调
│  └─────────────────────────────────────────────┤
└────────────────────────────────────────────────┘
```

#### GAP

#### GATT

蓝牙有很大一部分需要自定义实现，但有一块是普遍支持的，称为 GATT(Generic Attribute Profile)

GATT 规定了对应的结构

在 GATT 的支持下，我们不再谈论中央设备和外围设备，而是客户端(中央设备)和服务器(外围设备)

每个服务器都提供一个或多个服务(service)，每项服务都有一个或多个特性(characteristic)，每个特性都有一个可以读取或写入的值(value)，每个值都是一个字节数组。
每个服务和特性都有一个唯一的 UUID，长度为 16 位或 128 位。严格的说，16 位 UUID 是为官方标准保留的，但几乎没有人遵循这一规则。

### 过程

#### 广播 Advertise

从机 -> 主机

```
一个数据包
 ▢ 最长为 37 Bytes，开头 6 Bytes 为 MAC 地址，31 字节为数据
 ▢ 37 Bytes 如果没用完，系统自动补零

       6 Bytes                                         31 Bytes
 ╭──────┴──────┬──────────────────────────────────────────┴──────────────────────────────────────────────╮
 ┌─────────────┬──────────────────┬──────────────────┬──────────────────┬──────────────────┬─────────────┐
 │ MAC Address │   AD Structure   │   AD Structure   │   AD Structure   │   AD Structure   │   ... ...   │
 └─────────────┴──────────────────┴──────────────────┴──────────────────┴──────────────────┴─────────────┘

一个 AD Structure

  1 Byte   1 Byte    N Bytes
 ┌───────┬────────┬────────────┐
 │  Len  │  Type  │  Data ...  │
 └───────┴────────┴────────────┘
   ║         ║         ╚ 内容
   ║         ╚  类型：[Ref](https://www.bluetooth.com/specifications/assigned-numbers/)
   ╚ 长度：内容为 Type长 + Data长 = 1 + N
```

广播类型

|      类型      |       用途       |  广播内容  | 可被连接 | 扫描响应 |
| :------------: | :--------------: | :--------: | :------: | :------: |
|  可连接非定向  |      最常见      | 正常广播包 |    是    |   支持   |
|   可连接定向   | 已配对的快速响应 | 定向广播包 | 指定设备 |  不支持  |
| 不可连接非定向 | 用于信标、传感器 | 正常广播包 |    否    |  不支持  |
|  可扫描非定向  |        /         | 正常广播包 |    否    |   支持   |

#### 扫描请求响应 Scan Request/Response

##### 扫描请求

主机 -> 从机

##### 扫描响应

从机 -> 主机

格式和广播数据一样

是非必须的，可以作为广播的数据补充

#### 状态切换

![ble states](/assets/ble-states.png)

从机 sample

```py
from ubluetooth import BLE
from machine import Pin

led = Pin(2, Pin.OUT)
adv_data = b'\x02\x01\x05\x05\x09\x42\x69\x62\x69'
resp_data = b'\x06\xFF\x41\x42\x43\x44\x45'

ble = BLE()
ble.active(True)
led.on()
# transfer: 就绪态 -> 广播态
ble.gap_advertise(100, adv_data = adv_data, resp_data = resp_data) # advertise

def ble_irq(event, data): # ble interrupter
    if event == 1: # connected
        led.off()
    elif event == 2: # disconnected，连接态 -> 广播态
        # retransfer: 就绪态 -> 广播态
        ble.gap_advertise(100, adv_data = adv_data, resp_data = resp_data) # advertise
        led.on()

ble.irq(ble_irq)
```

## WebBluetooth

```ts
// 请求需要的硬件
let device = await navigator.bluetooth.requestDevice({
  filters: [{ namePrefix: "PLAYBULB" }],
  optionalServices: [0xff0f], // 想要使用的服务
});
// 用户蓝牙配对
let server = await device.gatt.connect();
// 获取服务和特性
let service = await server.getPrimaryService(0xff0f); // 传入需求服务的 uuid
let characteristic = await service.getCharacteristic(0xfffc); // 获取对应特性
// 读写, 都是 TypedArray
await characteristic.writeValueWithResponse(new Uint8Array([0, r, g, b]));
characteristic.writeValueWithoutResponse(new Uint8Array([0, r, g, b]));
let value: DataView = await characteristic.readValue();
// 事件监听
characteristic.addEventListener("characteristicvaluechanged", (e) => {
  let r = e.target.value.getUint8(1);
  let g = e.target.value.getUint8(2);
  let b = e.target.value.getUint8(3);
});
// 由于蓝牙的带宽有限，我们必须手动管理监听机制。否则，网络将被不必要的数据淹没
characteristic.startNotifications();
characteristic.stopNotifications();
```
