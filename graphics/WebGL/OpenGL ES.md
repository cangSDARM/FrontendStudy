# OpenGL ES 语言

### 规范

1. 任何名称都不能以 gl、webgl、\_webgl 开头
2. 矩阵为列主序
3. OpenGL 中，不允许函数调用自身（即不允许递归）
4. 如果函数声明在调用后，需要在前面对函数进行*规范声明*

> 函数规范

```js
 ctx.vertexAttrib    3      f     ();
|   基础函数名   |参数个数|参数类型|
```

> 变量规范

```js
//声明
 uniform     vec4 u_FColor;
| 存储限定符 |类型| 变量名 |
```

> 参数限定符

|   类别   |                      | 描述                                               |
| :------: | :------------------- | :------------------------------------------------- |
|    in    | 向函数传入值         | 函数可以对其值修改，但不影响传入的变量（默认）     |
| const in | 向函数传入值         | 函数不可修改其值                                   |
|   out    | 赋值，并被传出       | 传入变量的引用。若在函数内被修改，则影响传入的变量 |
|  inout   | 传入、赋值，并被传出 | 传入变量的引用。若在函数内被修改，则影响传入的变量 |

```c
void luma(in vec3 color, out float brightness){
    brightness = color.x + color.y + color.z;
}
luma(color, brightness);    //结果存储在brightness中；和brightness = luma(color)效果相同
```

### 数据类型

**数值类型**。支持整数(int)和浮点数(float)。没有小数点的一概认为是整数

**布尔类型**。true、false

<span style="color:red;">字符类型不支持</span>

类型转换：`int(bool); int(float); ...`

访问限定符：`const`、`public`、`static`

运算符：支持自增、自减、\*=、逻辑（&& || ^^ !）、比较（>= <= !=）、三元运算符

| 类别 | 对应类型的构造函数名                                             | 描述                                                                                      |
| :--: | :--------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| 矢量 | vec2、vec3、vec4<br/>ivec2、ivec3、ivec4<br/>bvec2、bvec3、bvec4 | 具有 2、3、4 个浮点数的矢量<br/>具有 2、3、4 个整数的矢量<br/>具有 2、3、4 个布尔值的矢量 |
| 矩阵 | mat2、mat3、mat4                                                 | 2x2、3x3、4x4 的浮点数矩阵                                                                |

#### 结构体

```c
sturct light{   //定义结构体
    mat4 mt;
    vec4 ve;
}
light l1, l2;   //声明结构体变量 l1 l2

//等效
sturct light{
    mat4 mt;
    vec4 ve;
} l1 l2;

l1 = light(mat4(1.0), vec4(0.2));   //结构体构造函数。参数顺序必须与定义顺序一致

mat4 mt4 = l1.mt;   //结构体内容的访问
```

#### 数组

- 对于*三维对象*, 使用**齐次坐标**来赋值

- OpenGL 只有一维数组
- 索引值从 0 开始
- 只有整型常量（带 const 的）和 uniform 变量可以作为索引

```c
float fArr[4];  //声明含有4个浮点数的数组

fArr[0] = 1.0;  //数组初始化必须显式地、每个独立地初始化，不能在声明时一次性的初始化
fArr[1] = 3.0;
```

#### 纹理（Sampler）

- 使用该类型变量访问纹理
- 该变量只能是`uniform`
- 唯一能赋值给它的是*纹理单元*的编号（参看 TextureQuad.md）

```c
uniform samplerCube u_Sampler;
uniform sampler2D u_Sampler;
```

#### 精度

- 与系统相关。标准字节数有可能有浮动
- 片元着色器的 float 的精度*必须手动指定*

```c
precision 精度限定字 类型名称;   //必须在片元着色器或顶点着色器顶部
//精度限定字:
// highp  16字节
// mediump 10字节
// lowp   8字节
precision mediump float;    //使所有 float 类型使用中精度
mediump float size;     //中精度的float变量size
```

#### 宏

- 内置宏：`GL_ES`、`GL_FRAGMENT_PERCISION_HIGH`

```c
#if 表达式
#endif

#ifdef 宏
#endif

#ifndef 宏
#endif

#define 定义宏
#undef 解除宏定义
```

### 访问元素

```c
vec4 v = vec4(1.0, 2.0, 0.0, 3.0);

v.x, v.y, v.z, v.w; //顶点坐标分量

v.r, v.g, v.b, v.a; //颜色分量

v.s, v.t, v.p, v.q; //纹理坐标分量
```

实际上，任何矢量的 x、r 或 s 都会返回第一个分量；y、g、t 返回第二个。这些可以通用。但不能混用（如 v.r，再用 v.y 就不行)

**混合**

```c
vec2 v2;
v2 = v.xy;  //设v2为(1.0, 2.0)
v2 = v.yz;  //设v2为(2.0, 0.0) 可以省略任意分量
v2 = v.xz;  //可以跳过任意分量
v2 = v.yx;  //可以逆序
v2 = v.xx;  //可以任意重复

v2.xy = vec2(1.0, 2.1); //可以作为左值
```

**\[\] 运算符**

```c
mat4 m = mat4(1.0);

vec4 v4 = m[0]; //取m的第一列。即(1.0, 0.0, 0.0, 0.0)
float f = m[2][3];  //取m的第2列第3个元素。即(0.0)
f = m[2].y; //可以同时使用分量和[]
```

#### 逻辑控制

包含：`if-else`、`while`、`do-while`、`for`

逻辑：`continue`、`break`、`discard`（只能在片元中使用，表示放弃该片元直接处理下一片元）
