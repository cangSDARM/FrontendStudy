- [采集](#采集)
  - [Bayer RAW](#bayer-raw)
  - [Web](#web)
- [预处理](#预处理)
  - [色彩空间](#色彩空间)
    - [YUV](#yuv)
- [编码](#编码)
  - [格式](#格式)
    - [JPEG/JFIF](#jpegjfif)
    - [WebP](#webp)
    - [PNG](#png)
    - [BMP](#bmp)
- [封装](#封装)
  - [格式](#格式-1)
    - [DNG](#dng)
    - [GIF](#gif)
    - [TIFF](#tiff)
    - [HEIF](#heif)
- [渲染](#渲染)
  - [Web](#web-1)

## 采集

### Bayer RAW

CMOS 受制造工艺限制，一个像素电极只能镀一种滤光片(R/G/B)，被迫用拜耳阵列，对应输出格式就是 Bayer RAW

### Web

用 ImageData(Uint8ClampedArray)

- 固定 RGBA 非预乘

## 预处理

### 色彩空间

#### [YUV](./video/README.md#yuv)

通常图像编码使用 YUV，展示用 RGB

## 编码

由于图片也几乎等于单帧视频，所以存在以视频编码的图片，如 H.264, AV1 等

### 格式

#### JPEG/JFIF

#### WebP

#### PNG

#### BMP

## 封装

绝大多数图片是单编码专属容器，编码和容器强绑定，对应编码=对应封装

### 格式

#### DNG

#### GIF

#### TIFF

#### HEIF

## 渲染

### Web

用 ImageBitmap

- 只能由媒体资源创建
- 像素格式: 底层 BGRA 预乘，对外 RGBA
- 绘制性能: GPU 共享内存中，性能极高，零拷贝
