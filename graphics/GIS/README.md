- [Coordinate Systems](#coordinate-systems)
- [GIS 标准定义](#gis-标准定义)
  - [metadata](#metadata)
  - [SRID \& EPSG CODE \& WKID](#srid--epsg-code--wkid)
  - [国内常见的地理坐标系](#国内常见的地理坐标系)
- [使用 Gis](#使用-gis)
- [Gis Data](#gis-data)
  - [地形 Terrain](#地形-terrain)
  - [影像 Imagery](#影像-imagery)
    - [3D Tiles](#3d-tiles)
  - [数据下载和处理](#数据下载和处理)
    - [下载](#下载)
    - [处理](#处理)
- [编程语言](#编程语言)
  - [Js](#js)
    - [Openlayers](#openlayers)
    - [Cesium](#cesium)

## Coordinate Systems

- latitude 纬度 longitude 经度
- 地理坐标系(GCS)
  - 大地水准面
    - 第一级(最类似)逼近。没有疑虑
    - 假设海平面衍生到所有大陆形成的曲面
  - 高程: 海拔某一点到大地水平面的垂直高度，也称绝对高程
  - 地球椭球体(reference ellipsoids)
    - 第二级逼近。有不同模型
    - 不同的地球数学抽象球体模型
    - 参数: 长半轴赤道半径 a, 短半轴极半径 b, 椭球体扁率(a-b)/a, 第一偏心率(a^2-b^2)/a^2, 第二偏心率(a^2-b^2)/b^2
  - 大地基准面(datums)
    - 第三级逼近
    - 具体实地测量的精确数值/基准点。定义了对应的坐标系(经纬度的原点和方向)
    - 定义方法:
      1. 对椭球上加了某些固定点再加上椭球体的曲面做平滑
      2. 以基准点基础切椭球体定义本地椭球体。相切重合度较高的地方可以假设为完全理想的椭球体。在本地使用时即可以该本地椭球体为参照
    - 分为:
      - 地心基准面(Geocentric datums)
        - 使用卫星数据采集得到
        - 对应坐标系称为地心坐标系
      - 本地基准面(Local datums)
        - 基于假设的与椭球体完全一样的点(大地起算点)。其他点坐标值可以基于此由算法算出坐标
        - 对应坐标系称为参心坐标系
- 投影坐标系(PCS)
  - mercator 是地图的平面化投影方式，便于计算距离
  - PCS = GCS + mercator

不同的 reference ellipsoids (空间参考) 和 datums (标准点) 以及 mercator(投影方式) 会导致同一个地点的 经纬度 坐标偏离

## GIS 标准定义

### metadata

描述了如何使用 gis data 以及其他使用条件、约束

通常会有标准定义，如美国的 FGDC Geospatial Metadata Standards

通常存放为 xml 或 html 文件

### SRID & EPSG CODE & WKID

OGC SRID & EPSG CODE & WKID 分别属于不同组织、公司制定的标识符。
虽然定义组织不同，但三者对同一空间参照系统的 ID 是一样。

EPSG（European Petroleum Survey Group, 欧洲石油调查小组），是一个涉及测地学、测量、制图学与石油勘探相关的科学组织。
EPSG 2005 年重组为 OGP(Internation Association of Oil & Gas Producers)
EPSG CODE 是 EPSG 组织创建的一套坐标参考系统数据集的标识码。

OGC & SRID(Open Geospatial Consortium, Spatial Reference System Identifier)，自称是一个非盈利的、国际化的、自愿协商的标准化组织。
SRID 就是 OGC 标准中关于空间参考系统标识码。
SRID 除了定义 0-altitude reference，reference ellipsoids，datums 等，他还会定义坐标轴的单位和顺序，例如是度，还是公里，是 lng/lat 还是 lat/lng

ArcGIS & WKID/WKT (Each projected and geographic coordinate system is defined by either a well-known ID/Text)
ArcGIS 定义了 WKID 作为坐标参考系统的标识。

### 国内常见的地理坐标系

- 地心坐标系:
  - `WGS-84(EPSG:4326)`
    - 目前最流行的地理坐标系统，美国 GPS 就是使用的这个。84 指最后修改的时间，1984
    - 定义了 reference ellipsoids 和 datums
  - `CGCS-2000(4490)`
    - 中国国家大地坐标系。现行标准。天地图采用的就是这个
    - 对于精度在 10m 以上的数据来说，它和 WGS 的差异可以忽略不计
    - 仅定义 reference ellipsoids
- 参心坐标系:
  - `xian-80(4610)`: 1980 年西安坐标系，又简称西安大地原点，现已退出历史舞台
  - `beijing-54(4214)`: 北京 54 坐标系，现已退出历史舞台
  - `GCJ-02`: 中国的坐标测量标准系统。基于 CGCS-2000/WGS-84，对经纬度加了很多随机偏移以实现加密
  - `BD-09`: 百度的坐标测量标准系统。基于 GCJ-02。进行了二次加密以防止他人使用百度的数据
- 投影:
  - `Gauss-Kruger`: 高斯-克吕格投影
    - 其投影精度高，变形小，而且计算简便
    - 多在大比例尺地形图中应用，可以满足军事上的需要
  - `UTM(Universal Transverse Mercator)`: 通用横轴墨卡托投影
    - 坐标基于 WGS-84
    - 可以使得地图在投影时不至于拉伸变形
    - 大部分的卫星影像和局部地图资料常采用 UTM 投影。但块的大小不一，不适合网页显示
  - `Pseudo-Mercator(EPSG:3857)`: 伪墨卡托投影，也称为 Spherical Mercator/Web Mercator
    - 基于墨卡托投影，可以把 WGS-84 投影到正方形
    - GCJ-02 保证投影后的线性单调性，因此可以直接用
    - 各大互联网地图公司以它为准。伪墨卡托非常适合显示数据、但不适合存储数据(完全不准)
  - `BD09-MC`: 百度对自己 BD-09 的投影方法。BD-09 无法保证投影后的线性单调性(地图会变形)，因此需要自己的投影方式纠偏
  - ![我国常见投影](/assets/chinese-common-map-projector.png)

在服务端，通常存储数据都是使用 4326
在前端，地图渲染使用 3857 坐标系
而处理数据，使用经过定制的 4326 坐标系（如 GeoJSON ，使用经纬度反过来的 4326 坐标系）

GCJ-02 和 WGS-84 的转换
https://github.com/googollee/eviltransform
https://github.com/wandergis/coordtransform

## 使用 Gis

https://gdal.org/ 操作 gis data 的底层库，提供了多种语言的绑定

https://cesium.com/ 操作 gis 的库(SASS)，通常给 js 用

## Gis Data

- Vector
  - 使用离散的数据集合将地图抽象为几何图形。如 GeoJson、shpfile、topojson 格式
  - 类似于 SVG + 属性信息 + 投影信息
- Raster: 对地图划分 Cell，对每个 Cell 进行具体的实测或抽象建模。
  - 类似于 BMP + 投影信息
- 3D Tiles(瓦片)
  - 在 gltf 的基础上，加入了分层 LOD 的概念，专门为流式传输和渲染海量 3D 地理空间数据而设计
  - 定义了一种数据分层结构和一组切片格式

Gis 分层定义了地图的元素

通过 Gis 软件定义/描述地图

Gis 存储通常放在 database 里，所以 sql 非常重要。Gis 扩展了 sql，有 spatial query (空间集合查询)

### 地形 Terrain

[参考](https://zhuanlan.zhihu.com/p/20875610226)

地形是地球表面的表示，它提供了高程信息(GIS 中约等于法线 + 材质)

表示方法

- 2.5D
  - 将 2D 表面中每个位置(x，y)分配给一个唯一的高度 z
  - 没法表示阳台、洞穴等
  - GIS 软件中常用的方法
- 2.7D
  - 在给定的位置(x，y)上可以存在多个 z 值
  - 在 CAD 中很流行，但在 GIS 中却很少见
- 3D
  - 不止包括位置信息

2\.5D(GIS 中)的生成方法

1. 采集地形的真实点云数据
2. 空间插值，在任意位置(x，y)处获取一个有且仅有一个高程值
   - 点 + 全局插值函数. 如: 反距离权重、自然邻近或克里金插值
   - 分段插值函数: 将空间的切分(tessellations)分为三类切分，然后对不同切分的不同内容使用不同的函数
     - 规则(regular): 所有单元格具有相同的形状和大小。如 GIS 中的网格(栅格表示)
     - 不规则(irregular): 单元格可以具有任意形状和大小。如 GIS 中的不规则三角网(TIN)。三角网通常使用 Delaunay 切分方法
     - 层次(hierarchical): 多层规则或不规则切分。如四叉树(规则)

存储格式

- Small Terrain 基于 Heightmap 的地形(仅有法线数据)，中等分辨率
- STK World Terrain 基于 TIN 的地形(包含其他可以供 Shader 渲染的)，高分辨率

常用处理

- 分析
  - 等高线分析
  - 坡度分析
  - 坡向分析
  - 地形挖方分析
- 处理
  - 夸张(Exaggeration)
  - 采样(Sampler)
  - 裁剪(Clipping)
  - 三角网(Wireframe)

### 影像 Imagery

#### 3D Tiles

在 glTF 基础上，加入了分层 LOD，专门为流式传输和渲染 3D 地理空间数据而设计

瓦片集(Tileset)由一组瓦片(Tile)按照空间数据结构(树状)组织，包含：

- 描述的 JSON 文件
- 批处理 3D 模型(Batched 3D Model, .b3dm): 异构模型。例如带纹理的地形和表面，3D 建筑内外部，大型模型
- 实例化 3D 模型(Instanced 3D Model, .i3dm): 树木、风车、螺栓等
- 点云(Point Cloud, .pnts): 大量的点
- 复合(Composite, .cmpt)

### 数据下载和处理

#### 下载

地理空间数据云、BIGMAP、太乐地图、图新地球LocaSpace Viewer、奥维互动地图、91地图助手、水经注、Global Mapper、SRTM DATA

#### 处理

CesiumLab、gdal2srtmtiles、github/ahuarte47/cesium-terrain-builder

## 编程语言

### Js

- gcoord 地理坐标转换
- @deck.gl 2维地图(分层数据)的显示

#### Openlayers

基于 prototype.js 的 2.5D 地图

#### [Cesium](./Cesium.md)
