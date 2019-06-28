# Threejs
## GUI
[Link](https://github.com/dataarts/dat.gui)<br/>
[Simple Tutorial](http://www.hangge.com/blog/cache/detail_1785.html)
## Init
```js
(function(){
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 500);
    var renderer = new THREE.WebGLRenderer({antialias:true});   //antialias开启抗锯齿

    renderer.setClearColor(0x000000);    //renderer bg color
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;  //soft shadow

    var axis = new THREE.AxisHelper(10);    //render the axis. you can dont add it.
    scene.add(axis);

    camera.position = {x: 0, y: 0, z: 0};
    camera.lockAt(scene.position);

    $("#container").append(renderer.domElement);
    renderer.render(scene, camera);
})();
```
## grid
```js
(function(){
    var grid = new THREE.GridHelper(50, 5); //size, line
    var color = new THREE.Color("rgb(255, 0, 0)");
    grid.setColor(color, 0x000000); //fill color & lines color
})()
```
## basic cube and castShadow
```js
(function(){
    var cubeGeometry = new THREE.BoxGeometry(5, 5, 5);
    //var cubeMaterial = new THREE.MashBasicMaterial({color: 0xdddddd}); //basic material cannot set shadow
    var cubeMaterial = new THREE.MashLanbertMaterial({color: 0xff3300});
    //var cubeLine = new THREE.LineBasicMaterial({color: 0xff3300});
    /*var shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse: {type: "t", value: null}
        },
        vertexShader: document.getElementById('vertex').textContent,
        fragmentShader: document.getElementById('fragmet').textContent,
      })
    */
    var cube = new THREE.Mash(cubeGeometry, cubeMaterial);  //mash cannt directly be changed a THREE.Line. To be that, you need switch the Material

    cube.rotation.x = .5 * Math.PI;
    cube.position.x = 0;
    cube.position.y = 0;
    cube.position.z = 0;

    cube.material.wireframe = true; //only show the 线稿

    cube.castShadow = true; //cast shadow. need a object to receive the shadow.
    //for example: image have a plane
    plane.receiveShadow = true;
    
    scene.add(cube);

    var spotLight = new THREE.SoptLight(0xffffff);
    spotLight.castShadow = true;
    spotLight.position.set(0, 0, 0);

    scene.add(spotLight);
})()
```
## Animation
```js
(function(){
    rotate();   //函数提升
    function rotate(){
        scene.traverse(function(e){      // 该方法也可以遍历scene和scene的所有后代
            if (e instanceof THREE.MEsh){
                e.rotate.x = .1;
            }
        })

        window.requestAnimationFrame(rotate);  //window.requestAnimationFrame() 告诉浏览器——你希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画。该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行
        renderer.render(scene, camera);     //re render
    }
})()
```

## FreeControlScene
```js
(function(){
    control = new THREE.OrbitControls( camera, renderer.domElement );
    control.target = new THREE.Vector3(0, 0, 0);    //look at
    control.autoRotate = false;

    clock = new THREE.Clock();  //用于更新轨道控制器
    control.addEventListener('change', function(){
        delta = clock.getDelta();
        control.update(delta);
    });
})()
```
## Stats - 性能检测用
```js
(function(){
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);
})()
```
## Resize
```js
(function(){
    $(window).resize(function(){
        var ScreenWidth = window.innerWidth;
        var ScreenHeight = window.innerHeight;
        camera.aspect = ScreenWidth / ScreenHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(ScreenWidth, ScreenHeight);
    })
})()
```
## Remove
```js
(function(){
    let com = new THREE.Mesh(cubeGeometry, cubeMaterial);
    scene.add(com);
    let array = scene.children;
    let last = array[array.length-1];
    if (last instanceof THREE.Mesh){
        scene.remove(last);
    }
}){}
```
## LoadModels
```js
(function(){
    //recommend glTF™ format model
    //var loader = new THREE.ColladaLoader();     //Collada(.dae)格式的模型加载器
    var loader = new THREE.GLTFLoader();
    var dae;
    var mixers = [];
    loader.options.convertUpAxis = true;
    loader.load('./', function(collada){
        dae = collada.scene;    //load the model's scene
        dae.scale.set(3, 3, 3);
        dae.traverse(function(child){
            if(child.colladaId == 'ObjectName'){    //find a specific object
                child.traverse(function(e){
                    e.castShadow = true;
                    e.receiveShadow = true;
                    if(e.material instanceof THREE.MeshPhongMaterial){
                        e.material.needsUpdate = true;
                    }
                });
            }
        });

        scene.add(dae);     //add model to the scene

        // 调用动画
        var mixer = new THREE.AnimationMixer( gltf.scene.children[2] ); 
        mixer.clipAction( gltf.animations[ 0 ] ).setDuration( 1 ).play();
        mixers.push(mixer);
    });

    for (var i = 0; i < mixers.length; i++) { // 重复播放动画
        mixers[i].update(new THREE.Clock.getDelta());
    }
})()
```
## Audio
```js
(function(){
    //<audio src="xx.mp3" id="audiothat"></audio>
    var ctx = new AudioContext();
    var audio = document.getElementById("audiothat");
    var audioSrc = ctx.createMediaElementSource(audio);
    var analyser = ctx.createAnalyser();

    audioSrc.connect(analyser);
    audioSrc.connect(ctx.destination);
    var frequencyData = new Uint8Array(analyser.frequencyBinCount);

    audio.play();
})()
```
## Bones&Skeleton
```js
(function(){
    //加载模型
    var loader = new THREE.GLTFLoader();
    loader.load("/lib/assets/models/hand-1.js", function (geometry) {

        mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshLambertMaterial({
            skinning: true,     //skinning属性设置为true，否则骨头不会运动
        }));

        skeletonHelper = new THREE.SkeletonHelper( mesh );  //显示骨骼点的位置
        skeletonHelper.visible = false;
        scene.add( skeletonHelper );

        scene.add(mesh);
    });

    mesh.skeleton.bones[21].rotation.set(0, 0, pos);    //修改某些骨骼点的方向
})()
```
## Particle
```js
(function(){
    var geom = new THREE.Geometry();    //存放粒子数据的网格
    //样式化粒子的THREE.PointCloudMaterial材质
    var material = new THREE.PointCloudMaterial({
        size: 1,
        transparent: true,
        opacity: Math.random(),
    });

    var range = 500;
    for (var i = 0; i < 15000; i++) {
        var particle = new THREE.Vector3(Math.random() * range - range / 2, Math.random() * range - range / 2, Math.random() * range - range / 2);
        geom.vertices.push(particle);
        var color = new THREE.Color(+randomColor());
        //.setHSL ( h, s, l ) h — 色调值在0.0和1.0之间 s — 饱和值在0.0和1.0之间 l — 亮度值在0.0和1.0之间。 使用HSL设置颜色。
        //随机当前每个粒子的亮度
        color.setHSL(color.getHSL().h, color.getHSL().s, Math.random() * color.getHSL().l);
        geom.colors.push(color);
    }

    //生成模型，添加到场景当中
    cloud = new THREE.PointCloud(geom, material);
    scene.add(cloud);
})()
```
## Post Porcessing
```js
(function(){
    //Threejs 提供23种后期处理通道, 是配置化的(看了源码的可以自己改)

    var renderPass = new THREE.RenderPass(scene, camera);  //renderPass 通道：它只会渲染场景，但不会把结果输出到场景上
    var effectFilm = new THREE.FilmPass(0.8, 0.325, 256, false);  //FilmPass通道：它可以把结果输出到场景上

    var shaderPass = new ShaderPass(MirrorShader);  //Shader传递自定义着色器
    shaderPass.uniforms['time'].value = 100;    //修改shader的参数值
    
    effectFilm.renderToScreen = true;  //设置是否渲染到场景中
    /*创建一个Three.EffectComposer() 它是一个组合器*/
    var composer = new THREE.EffectComposer(renderer);
    /*每个通道都会按照其加入EffectComposer的顺序执行。
    * 第一个加入的通道是RenderPass下面这个通道会渲染场景，但不会将渲染结果输出到平面上
    * FilmPass可以将其结果输出到屏幕上。这个通道是在RenderPass后面添加
    * */
    composer.addPass(renderPass);
    composer.addPass(shaderPass);
    composer.addPass(effectFilm);

    composer.render();  //use post processing
})()
```
### ShaderExample:
```html
//Threejs使用的Shader语言是GLSL

/*创建自定义的着色器，需要实现两个组件: 
    vertexShader和fragmentShader
    组件vertexShader 用来调整每个顶点的位置; 
    组件fragmentShader可以从来决定每个像素的颜色
对于后期处理着色器来说，我们只要实现fragmentShader即可, 然后使用Three.js提供的默认vertexShader
*/
//1. 在html里写Shader
<script id="vertex" type="x-shader/x-vertex">
    varying vec2 vUv;
    void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
</script>
<script id="fragment" type="x-shader/x-fragment">
    uniform float rPower;
    uniform float gPower;
    uniform float bPower;
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    void main(){
        vec4 texel = texture2D(tDiffuse, vUv);
        float gray = texel.r * rPower + texel.g * gPower + texel.b * bPower;
        gl_FragColor = vec4(vec3(gray), texel.a);
    }
</script>
<!-- 然后在js里使用docment.getElementById().textContent调用 -->
//2. 在js里写Shader
THREE.CustomGrayScaleShader = {
    uniforms: {
        "tDiffuse": {type: "t", value: null},
        "rPower": {type: "f", value: 0.2},
        "gPower": {type: "f", value: 0.7},
        "bPower": {type: "f", value: 0.1} 
    },
    vertexShader: `
        varying vec2 vUv;, 
        void main(){, 
            vUv = uv;, 
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);,
        }
    `,
    fragmentShader: `
        uniform float rPower;,
        uniform float gPower;,
        uniform float bPower;,
        uniform sampler2D tDiffuse;,
        varying vec2 vUv;,
        void main(){,
            vec4 texel = texture2D(tDiffuse, vUv);, 
            float gray = texel.r * rPower + texel.g * gPower + texel.b * bPower;,
            gl_FragColor = vec4(vec3(gray), texel.a);,
        }
    `
}
```
## RayCast
```js
(function(){
    var ray = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var objects = [];

    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('touchstart', onTouchStart, false);

    function onMouseDown(e){
        e.preventDefault();     //通知浏览器不要执行与事件关联的默认动作
        mouse.x = (e.clientX / renderer.domElement.width) * 2 - 1;
        mouse.y = (e.clientY / renderer.domElement.height) * 2 - 1;

        ray.setFromCamera(mouse, camera);
        var intersects = ray.intersectObjects(objects);
        if(intersects.length > 0){
            //hitting. do someting
            intersects[0].object.material.color.setHex(Math.random() * 0xffffff);
        }
    }
    function onTouchStart(e){
        e.preventDefault();
        e.clientX = e.touches[0].clientX;
        e.clientY = e.touches[0].clientY;
        onMouseDown(e);
    }
})()
```