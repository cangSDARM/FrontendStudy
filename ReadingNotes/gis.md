- [Coordinate Systems](#coordinate-systems)
- [GIS 标准定义](#gis-标准定义)
  - [metadata](#metadata)
  - [SRID \& EPSG CODE \& WKID](#srid--epsg-code--wkid)
  - [国内常见的地理坐标系](#国内常见的地理坐标系)
- [使用 Gis](#使用-gis)
- [Gis Data](#gis-data)

## Coordinate Systems

- latitude 纬度 longitude 经度
- 地理坐标系(GCS)
  - 大地水准面
    - 假设海平面衍生到所有大陆形成的曲面
    - 第一级(最类似)逼近。没有疑虑
  - 高程: 海拔某一点到大地水平面的垂直高度，也称绝对高程
  - 地球椭球体(reference ellipsoids)
    - 不同的地球数学抽象球体模型
    - 参数: 长半轴赤道半径 a, 短半轴极半径 b, 椭球体扁率(a-b)/a, 第一偏心率(a^2-b^2)/a^2, 第二偏心率(a^2-b^2)/b^2
    - 第二级逼近。有不同模型
  - 大地基准面(datums)
    - 具体实地测量的精确数值/基准点。相当于对椭球上加了某些固定点再加上椭球体的曲面做平滑，使得数据更为贴合实际
      - 地心基准面(Geocentric datums)
        - 使用卫星数据采集得到
        - 对应坐标系称为地心坐标系
      - 本地基准面(Local datums)
        - 基于假设的与椭球体完全一样的点(大地起算点)。其他点坐标值可以基于此由算法算出坐标
        - 对应坐标系称为参心坐标系
    - 定义了对应的坐标系(经纬度的原点和方向)
    - 第三级逼近
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
    - 大部分的卫星影像和局部地图资料常采用 UTM 投影。但块的大小不一，不适合网页显示。
  - `Pseudo-Mercator(EPSG:3857)`: 伪墨卡托投影，也称为 Spherical Mercator/Web Mercator
    - 基于墨卡托投影，可以把 WGS-84 投影到正方形
    - GCJ-02 保证投影后的线性单调性，因此可以直接用
    - 各大互联网地图公司以它为准。伪墨卡托非常适合显示数据、但不适合存储数据(完全不准)
  - `BD09-MC`: 百度对自己 BD-09 的投影方法。BD-09 无法保证投影后的线性单调性(地图会变形)，因此需要自己的投影方式纠偏

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
  - 使用离散的数据集合将地图抽象为几何图形。如 GeoJson、gis shape file 格式
  - 类似于 SVG + 属性信息 + 投影信息
- Raster: 对地图划分 Cell，对每个 Cell 进行具体的实测或抽象建模。
  - 类似于 BMP + 投影信息

Gis 分层定义了地图的元素

通过 Gis 软件定义/描述地图

Gis 存储通常放在 database 里，所以 sql 非常重要。Gis 扩展了 sql，有 spatial query (空间集合查询)
