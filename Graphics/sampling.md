- [光栅采样](#光栅采样)
  - [FXAA](#fxaa)
  - [SMAA](#smaa)
  - [MSAA](#msaa)
    - [采样点](#采样点)
  - [TAA](#taa)
  - [SSAA](#ssaa)
- [纹理采样](#纹理采样)
  - [Nearest](#nearest)
  - [Bilinear](#bilinear)
  - [Trilinear](#trilinear)
  - [Anisotropic Filtering](#anisotropic-filtering)

## 光栅采样

发生在光栅化阶段，决定屏幕像素如何判定三角形有没有覆盖，解决几何体轮廓锯齿。
和贴图无关，只针对三角形、线条、面片边缘

### FXAA

Fast-Approximate Anti-Aliasing

- 后期图像模糊算法
- 有[标准实现(FXAA 3.11)](https://gist.github.com/cart/7d2da58eb28c75c0952787f29f3e562f?f_link_type=f_linkinlinenote&flow_extra=eyJpbmxpbmVfZGlzcGxheV9wb3NpdGlvbiI6MCwiZG9jX3Bvc2l0aW9uIjowLCJkb2NfaWQiOiI2MWNlOGU1Yjk1OTI5ODQzLThmMTM5YmJiZjYyMWIwYmMifQ%3D%3D)和[文档](https://developer.download.nvidia.cn/assets/gamedev/files/sdk/11/FXAA_WhitePaper.pdf)

### SMAA

Subpixel-Morphological Anti-Aliasing

- 后期图像模糊算法
- 三 Pass (Edge Detection/Blending Weight Calculation/Neighborhood Blending)精细边缘形态匹配，最大程度保留纹理锐度
- 有[标准实现和文档](https://www.iryoku.com/smaa/)

### MSAA

Multisample Anti-Aliasing, 需要硬件支持

- 每个像素放置多个子采样点位，逐个判断点位是否被三角覆盖，生成覆盖率掩码
- 深度、模板是每个子采样独立测试；通常每个像素只跑 1 次片元着色器

问题:

- 延迟渲染 G-Buffer 多附件开 MSAA 显存成本爆炸、管线没法正常采样 MSAA Texture，因此 Deferred 基本不用 MSAA
- 传统早期硬件 MSAA + HDR 浮点颜色缓冲有驱动兼容性问题

#### 采样点

为消灭横竖直线的摩尔纹、阶梯锯齿，让所有角度边缘的平滑度更均匀:

- 2x MSAA: 两点斜对角排布
- 4x MSAA: 45°旋转菱形网格点
- 8x / 16x MSAA: 抖动稀疏网格 / 类泊松散点

### TAA

Temporal Anti-Aliasing

- 复用前后多帧的像素采样历史，用时间累积实现抗锯齿

### SSAA

Super-Sample Anti-Aliasing

- 将分辨率拉高，最后缩放到屏幕
- 每个子采样都完整执行片元着色器，既是光栅采样也附带纹理重复采样，成本极高

## 纹理采样

发生在片元着色器读取贴图时。
根据 UV 坐标读取纹理纹素，用插值算法决定最终颜色。只管贴图内部像素过渡，和模型轮廓无关

### Nearest

只取 UV 落点最近1 个纹素，无插值。无模糊。

### Bilinear

同一个 Mipmap 内，取 UV 周围 2×2 个纹素，U、V 双轴线性加权插值。
放大平滑，近距离贴图首选。

### Trilinear

同时取相邻两层 Mipmap，每层各自做 Bilinear，两层结果再线性混合。消除 Mip 层级切换断层

### Anisotropic Filtering

普通双 / 三线性是正方形采样区域；AF 根据 UV 拉伸比例用长方形采样区域。地面、斜面斜贴图保留最多细节
