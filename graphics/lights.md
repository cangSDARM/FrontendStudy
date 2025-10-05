- [局部光照模型](#局部光照模型)
  - [传统光照模型](#传统光照模型)
    - [Ambient](#ambient)
    - [Diffuse](#diffuse)
    - [Specular](#specular)
  - [PBR](#pbr)
    - [PBR 材质/贴图](#pbr-材质贴图)
    - [PBR 光照](#pbr-光照)
    - [IDL](#idl)
    - [Ray-Tracing](#ray-tracing)
- [全局光照模型](#全局光照模型)

## 局部光照模型

光照模型认为物体表面光照由三部分组成:

- 环境光(Ambient): 场景中的其他间接光照
- 漫反射(Diffuse): 散射部分（大但不光亮）
- 高光反射(Specular): 镜面反射部分（小而亮）
- 自发光(Emissive)

### 传统光照模型

$L = L_a + L_d + L_s$

#### Ambient

$L_a = (K_a \times I_a)$

- $K_a$ 为环境光系数（常数）
- $I_a$ 为环境光强度（RGB）

#### Diffuse

##### Lambert

只考虑漫反射（暗部看起来太平）

$L_d = K_d \times (I / r^2) \times \max(N * L, 0)$

- $K_d$: 材质漫反射系数（漫反射遮罩 RGB）
- I: 光源强度（光的 RGB）
- r: 光源与物体表面距离，模拟光衰减。如平行光不需要考虑衰减时，公式可以简化为 $\times I$
- N: 表面的法线向量方向（归一化）
- L: 表面指向光源的向量（归一化）

##### Half Lambert

增加进光量（溢出部分颜色到暗部）

将 Lambert 的 $\max(N * L, 0)$ 修改映射范围为 $[\max(N * L, 0) \times 0.5 + 0.5]^2$

#### Specular

##### Phong

强调局部光照效果（反射总是圆形、高光边缘锐利）

$L_s = K_s \times (I_s / r^2) \times [\max(V * R, 0)]^p$

- $K_s$ 为高光系数（常数）
- $I_s$ 为高光强度（RGB）
- r: 光源与物体表面距离，模拟光衰减。如平行光不需要考虑衰减时，公式可以简化为 $\times I$
- R: 光源在物体表面某点发生镜面反射的方向（归一化）
- V: 物体表面某点指向摄像机位置的向量（归一化）
- p: 用于加快函数的衰减程度。即材质的光泽度，或叫反光度（常数）。表面越光泽则 p 越大，表面的亮点就越小

##### Blinn-Phong

使得高光更为平滑

将 Phong 的 $V * R$ 修改为 $N * H, (H = \frac{V + L}{\lVert V + L \rVert})$

- H: $V, L$的半程向量（摄像机、光源的角平分向量）
- N: 表面的法线向量方向（归一化）
- L: 表面指向光源的向量（归一化）

### PBR

基于物理的渲染。定义了一套图形学意义上何为的物理规则。包含:

#### PBR 材质/贴图

又分两种流程(Workflow)，区分在于贴图及 shader 流不一样

- Metallic-Roughness Workflow
  - BaseColor/Roughness/Metallic/AmbientOcclusion/Normal/Height
- Specular-Glossiness Workflow
  - Diffuse(Albedo)/Glossiness/Specular/AmbientOcclusion/Normal/Height

#### PBR 光照

基于物理的三个理论:

- 微平面理论
  - 没有平面是完全光滑的
- 能量守恒
  - 入射光线总是产生损耗
- 菲涅尔反射
  - 描述了光波在两种不同折射率的介质中传播时反射和折射的规律

$$
L_o(v) = L_e(v) + L_a(v) + \int_\Omega f(\omega_i,v)L_i(\omega_i)(n \cdot \omega_i)\,d\omega_i
$$

- v: 出射点
- $L_o(v)$: 到达出射点的总光照
  - 通常也有表述为$L_o(p,\omega_o)$, 即出射角度$\omega_o$对应距离 p 的方程
- $L_e(v)$: 物体自发光
- $L_a(v)$: 环境光
  - PBR中环境光通常使用 IBL(Image Base Lighting)解决, 即天空盒
- $\Omega$: 物体所有可能入射光线形成的半球
- $\int_\Omega f(\omega_i,v)L_i(\omega_i)(n \cdot \omega_i)\,d\omega_i$: 最终的反射光照
  - $f(\omega_i,v)$: 来自$\omega_i$上的入射光线有多少反射到视角 v 上
    - 即 BRDF(Bidirectional Reflectance Distribution Function)
  - $Li(\omega_i)(n \cdot \omega_i)$: 物体接收到的来自$\omega_i$上的入射光线
    - $(n \cdot \omega_i) = \cos(\theta) = \cos(\frac{\omega_i}{v})$: 由于忽略了所有指向内的光线，因此不需要计算 cos 函数

##### 经典 BRDF: Cook-Torrance BRDF

> 经典 BRDF 假设反射是局部性的，离开这个点的光只由到达这个点的光决定。在一些场景下这个假设不成立:
>
> - 半透明<br/>
> - 光线折射进入物体内部之后再被散射出来(次表面散射(Subsurface Scattering)技术考虑了)

$$
\begin{aligned}
&f(\omega_i,v)=f(\omega_i,\omega_o)=k_df_{lambert}+f_s\\
&f_{lambert}=\frac{\rho}{\pi}\\
&f_s=\frac{F_r(\omega_o, \omega_h)D(\omega_h)G(\omega_i,\omega_o)}{4\cos(\theta_o)\cos(\theta_i)}\\
&k_d=(1-F_r)\times(1-metalness)
\end{aligned}
$$

- $\rho, metalness$为常量
- $\omega_h$: 微平面法线方向
- $F_r,F_r(\omega_o, \omega_h)$: 菲涅尔方程。为了描述物理世界当中，观察角度与法线夹角越大反射程度一般越大的一种情形
  - 通常使用 Fresnel-Schlick 近似法求得近似解$F_{Schlick}(h,v,F_0) = F_0+(1-F_0)(1-(h \cdot v))^5$
  - $F_0$: 材质的基础反射率，通常提前计算近似
- $D(\omega_h)$: 法线分布函数。代表了所有微观角度下微小镜面法线的分布情况，粗糙表面法线分布相对均匀，光滑表面法线分布相对集中
  - 常见的 GGX/Trowbridge-Reitz 方程
    - $D(h) = \frac{roughness^2}{\pi((n \cdot h)^2(roughness^2 - 1) + 1)^2}$
- $G(\omega_i,\omega_o)$: 几何函数。表示微平面无法被照射(shadowing)+无法被反射(masking)的光线损失
  - 常见的 Schlick-GGX 方程
- $\theta_o, \theta_i$: 表示出射角$\omega_o$及入射角$\omega_i$相对于宏观法线方向$n$的夹角

#### IDL

把贴图上的颜色信息当做环境光源，带入 PBR 反射方程，推导近似可得:

$$
L(\omega_o) = \rho k_dIrradianceMap(n) + PrefilterMap(R)(F_0 * A + B)
$$

- IrradianceMap: 漫反射部分预烘焙贴图(1张)
- PrefilterMap: 镜面反射部分预烘焙贴图(n张，取决于粗糙度采样数)
- $R$: 反射方向
- $A, B$: LUT 贴图(1张)红、绿通道

#### Ray-Tracing

省略复杂的算式推导可得:

$$
\begin{aligned}
&L_o(v) = e(v) + \int L_i(u) \cdot K(u,v)\,dv\\
&L_o = E + KL_i\\
&L = E + KE + K^2E + K^3E...
\end{aligned}
$$

- L: 反射光(Vector)
- E: 光源所发出的光(Vector)
- K: 反射算子(复杂的算式组合的, Metrix)
- $K^2E$: 一次弹射的间接照明，$K^3E$就是两次弹射的间接照明，依次类推

## 全局光照模型
