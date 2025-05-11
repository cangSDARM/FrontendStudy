- [初始化](#初始化)
- [坐标和摄像机](#坐标和摄像机)
  - [摄像机](#摄像机)
  - [坐标](#坐标)
  - [Geocode](#geocode)
- [时钟](#时钟)
- [数据](#数据)
  - [Imagery](#imagery)
  - [Terrain](#terrain)
  - [Modal](#modal)
    - [Entity](#entity)
    - [Primitive](#primitive)
    - [Particle](#particle)
    - [3D Tile](#3d-tile)
- [交互](#交互)

Cesium 是用于 Web 的 GIS SASS 服务，需要注册才能用

以 XXXProvider 形式注入对应 GIS 的服务

Cesium 的地理模型:

- WGS-84(Cesium.Ellipsoid.WGS84) -> 笛卡尔坐标系(Cesium.Cartesian3)
- WGS-84 地理坐标(Cesium.) -> 弧度坐标(Cesium.Cartographic) -> 投影(Cesium.)

## 初始化

```js
Cesium.Ion.defaultAccessToken = "";
// 所有需要的 API 实际操作的对象
const viewer = new Cesium.Viewer("containerId", {
  // Cesium 自带控件
  timeline: false,
  animation: false,
  geocoder: false,
  homeButton: false,
  sceneModePicker: false,
  baseLayerPicker: false,
  navigationHelpButton: false,
  fullscreenButton: false,

  shouldAnimate: true,
  imageryProvider, // 默认是谷歌
  geocode, // 默认是 bing
});
```

## 坐标和摄像机

### 摄像机

```js
// Cesium 相机
viewer.camera.setView({
  destination: cartesian,
  // 默认(0, -90, 0)看向球心. 左右, 上下, 倾斜
  orientation: { heading: Cesium.Math.toRadians(0), pitch: 0, roll: 0 },
});
```

### 坐标

```js
const cartesian = Cesium.Cartesian3.fromDegrees(longitude, latitude, height); // 经纬度转
// 转回去
const carto = Cesium.Cartographic.fromCartesian(cartesian); // 弧度坐标(通常坐标是角度坐标)
const degrees = {
  long: (180 / Math.PI) * carto.longitude,
  la: Cesium.Math.toDegrees(carto.latitude),
  height: carto.height,
};
// Cesium.Matrix3: 描述旋转变换
// Cesium.Matrix4: 描述旋转+平移变换
// Cesium.Quaternion: 描述围绕某个向量旋转变换
```

### Geocode

```js
// Cesium 默认采用的是 Bing 地图服务来实现地理编码(GeoCode)的功能
const geocode = new CustomGeoCoder();

viewer.geocode;
```

## 时钟

```js
/** 时钟设置 */
const startTime = Cesium.JulianDate.fromDate(new Date(2025, 2, 16, 17, 0, 0));
const stopTime = Cesium.JulianDate.addSeconds(
  startTime,
  360,
  new Cesium.JulianDate(),
);

viewer.clock.startTime = startTime.clone();
viewer.clock.stopTime = stopTime.clone();
viewer.clock.multiplier = 20; // 时钟速度调为正常的 20 倍
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // 开启时钟动画，循环播放
viewer.timeline.zoomTo(startTime, stopTime); // 时间轴固定到指定范围
```

## 数据

### Imagery

ImageryProvider

```js
// Arc
const arc = new Cesium.ArcGisMapServerImageryProvider({ url: "" });
// 腾讯
const provider = new Cesium.UrlTemplateImageryProvider({
  url: "https://p2.map.gtimg.com/sateTiles/{z}/{sx}/{sy}/{x}_{reverseY}.jpg?version=400",
  customTags: {
    sx: function (imageryProvider, x, y, level) {
      return x >> 4;
    },
    sy: function (imageryProvider, x, y, level) {
      return ((1 << level) - y) >> 4;
    },
  },
  maximumLevel: 18,
  credit: "Tencent Map",
});
// 天地图
var imgMap = new Cesium.UrlTemplateImageryProvider({
  url: "https://t{s}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=da7665c4b8e7593a2cb6bd910400a71f",
  subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
  tilingScheme: new Cesium.WebMercatorTilingScheme(),
  maximumLevel: 18,
});
viewer.imageryLayers.addImageryProvider(imgMap);
// 国界和省界
var iboMap = new Cesium.UrlTemplateImageryProvider({
  url: "https://t{s}.tianditu.gov.cn/DataServer?T=ibo_w&x={x}&y={y}&l={z}&tk=da7665c4b8e7593a2cb6bd910400a71f",
  subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
  tilingScheme: new Cesium.WebMercatorTilingScheme(),
  maximumLevel: 10,
});

viewer.imageryProvider = arc;
```

### Terrain

```js
// 绑定 TIN 格式的 Terrain。(也支持 Arc/Google 的 ArcGisTerrainProvider)
const terrainProvider = new Cesium.CesiumTerrainProvider({
  url: "/assets/1.terrain",
  requestWaterMask: true, // 水体海岸线数据
  requestVertexNormals: true, // 地形照明数据
});

viewer.terrainProvider = terrainProvider;
```

### Modal

#### Entity

三维对象实体(组合)

```js
const entity = new Cesium.Entity({
  position: cartesian,
  point: { pixelSize: 10 }, // 点
  polyline: {
    // 线
    // 竖线
    positions: Cesium.Cartesian3.fromDegreesArrayHeights([
      120, 30, 0, 120, 30, 100,
    ]),
  },
  model: {
    uri: "/glb/aircraft.glb",
    minimumPixelSize: 200,
    maximumScale: 5000,
  },
});

viewer.entities.add(entity);

// 棋盘效果
entity.ellipse.material = new Cesium.CheckerboardMaterialProperty({
  evenColor: Cesium.Color.WHITE,
  oddColor: Cesium.Color.BLACK,
  // 奇偶交替的频次
  repeat: new Cesium.Cartesian2(6, 4),
});
// 网格效果
entity.ellipse.material = new Cesium.GridMaterialProperty({
  color: Cesium.Color.YELLOW, // 线条颜色和背景色
  cellAlpha: 0, // 背景色透明度
  lineCount: new Cesium.Cartesian2(8, 8), // 线条条数
  lineThickness: new Cesium.Cartesian2(5, 5), // 线条粗细
  lineOffset: new Cesium.Cartesian2(10, 10), // 线条偏移量
});
// 折线轮廓
entity.polyline.material = new Cesium.PolylineOutlineMaterialProperty({
  color: Cesium.Color.ORANGE,
  outlineWidth: 5,
  outlineColor: Cesium.Color.BLACK,
});
```

#### Primitive

三维对象图元(提供更底层的 api)

```js
const primitive = new Cesium.Primitive({
  geometryInstances: polyline,
  appearance: new Cesium.PerInstanceColorAppearance({
    flat: true, // 着色器使用平面着色，不考虑光照
  }),
});

viewer.scene.primitives.add(primitive);
```

#### Particle

也是 Primitive

```js
// 粒子效果(同样是 Primitive)
new Cesium.ParticleSystem({
  image: "/SampleData/fire.png",
  imageSize: new Cesium.Cartesian2(20, 20),
  emitter: new Cesium.CircleEmitter(2), // 圆形发射器
  modelMatrix: entity.computeModelMatrix(
    viewer.clock.startTime, // 时间控件中的开始时间
    new Cesium.Matrix4(), // 4 x 4矩阵数据
  ),
});
```

#### 3D Tile

也是 Primitive

```js
const tileset = await Cesium.Cesium3DTileset.fromUrl("/3dtiles/tileset.json", {
  show: true,
  // 为摄像机或 CPU 拾取启用碰撞
  enableCollision: true,
  // 否使用其子边界体积的并集来剔除平铺
  cullWithChildrenBounds: true,
  // 设置基础屏幕空间误差，用于控制加载时的细节层次
  skipLevelOfDetail: true,
  immediatelyLoadDesiredLevelOfDetail: true,
  baseScreenSpaceError: 1024,
  skipScreenSpaceErrorFactor: 16,
  // 瓦片加载的屏幕空间误差，默认16，值越小精度越高，开销越大
  maximumScreenSpaceError: 32,
  // 启用动态屏幕空间误差，根据相机的速度调整瓦片加载策略
  dynamicScreenSpaceError: true,
  dynamicScreenSpaceErrorDensity: 0.002,
  dynamicScreenSpaceErrorFactor: 4,
  // 跳过中间级别瓦片，直接加载低分辨率瓦片以加快初始加载速度
  skipLevels: 2,
  // 当摄像机正在飞行时，在摄像机的飞行目的地预加载切片
  preloadFlightDestinations: true,
  // 优先加载叶子节点
  preferLeaves: true,
});
viewer.scene.primitives.add(tileset);

// 贴地
const heightOffset = -70; // 调整模型的高度偏移
const boundingSphere = tileset.boundingSphere;
const cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
const surface = Cesium.Cartesian3.fromRadians(
  cartographic.longitude,
  cartographic.latitude,
  0.0,
);
const offset = Cesium.Cartesian3.fromRadians(
  cartographic.longitude,
  cartographic.latitude,
  heightOffset,
);
const translation = Cesium.Cartesian3.subtract(
  offset,
  surface,
  new Cesium.Cartesian3(),
);
tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation); // 用于转换图块集的根图块
```

## 交互

```js
// 配置视图倾斜事件
viewer.scene.screenSpaceCameraController.tiltEventTypes = [
  // 鼠标右键拖动时触发视图的倾斜操作
  Cesium.CameraEventType.RIGHT_DRAG,
  // 双指触摸时触发视图的倾斜操作
  Cesium.CameraEventType.PINCH,
  // 按住 Ctrl 键的同时，鼠标左键拖动时触发视图的倾斜操作
  {
    eventType: Cesium.CameraEventType.LEFT_DRAG,
    mofifier: Cesium.KeyboardEventModifier.CTRL,
  },
  // 按住 Ctrl 键的同时，鼠标右键拖动时触发视图的倾斜操作
  {
    eventType: Cesium.CameraEventType.RIGHT_DRAG,
    mofifier: Cesium.KeyboardEventModifier.CTRL,
  },
];
// 配置视图缩放事件
viewer.scene.screenSpaceCameraController.zoomEventTypes = [
  // 按住滚轮中键可以缩放
  Cesium.CameraEventType.MIDDLE_DRAG,
  // 滚动滚轮中键可以缩放
  Cesium.CameraEventType.WHEEL,
  // 手指可缩放
  Cesium.CameraEventType.PINCH,
];

// 场景渲染
viewer.scene.preUpdate.addEventListener(callbackFunc);
viewer.scene.postUpdate.removeEventListener(callbackFunc);
viewer.scene.preRender.removeEventListener(callbackFunc);
viewer.scene.postRender.addEventListener(callbackFunc);

// 屏幕交互
const posAtScreen = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
  viewer.scene,
  cartesian,
);
// 鼠标交互
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction((e: any) => {
  // 屏幕 -> 笛卡尔
  const mousePosInCesiumWorld = viewer.scene.globe.pick(
    viewer.camera.getPickRay(evt.position),
    viewer.scene,
  );

  let pick = viewer.scene.pick(e.endPosition); // 最顶部
  pick = viewer.scene.drillPick(); // 所有东西

  // 如果没有拾取到对象
  if (!Cesium.defined(pick)) return;

  // 重置上一次拾取模型的颜色
  if (Cesium.defined(pickModel)) {
    pickModel.color = Cesium.Color.WHITE;
  }
  pick.color = Cesium.Color.ORANGE;
  pickModel = pick;
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
// 键盘交互
viewer.clock.onTick.addEventListener((_e) => {
  if (flags.moveBackward) {
    camera.moveBackward(moveRate);
  }
});

// 一个Callback的包裹，主要用于动态 Entity 的属性
new Cesium.CallbackProperty(() => {
  num += 0.002;
  lon = 120 + num;
  lat = 30 + num;
  if (lon <= 121) {
    return Cesium.Cartesian3.fromDegreesArray([114, 30, lon, lat]);
  } else {
    viewer.entities.removeAll();
    const line1 = viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([114, 30, 121, 31]),
        material: Cesium.Color.RED,
        width: 5,
      },
    });
  }
}, false);

// 拾取
viewer.selectedEntityChanged.addEventListener((entity) => {
  console.log(entity);
});
// 镜头跟踪视角
viewer.trackedEntity = entity;
// 需要双击才能触发
viewer.trackedEntityChanged.addEventListener((entity) => {
  console.log(entity);
});
```
