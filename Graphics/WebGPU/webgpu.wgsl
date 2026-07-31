// WGSL 没有像 lowp 这样的精度说明符, 而是显式指定具体类型，例如 f32
// 基本数字类型: f32 / f, u32 / u, i32 / i, f16 / h
// 基本向量类型: vec2<num> / vec2f, vec3, vec4
// 基本矩阵类型(列主序): mat2x2<num> / mat2x2u, mat2x3, mat2x4, mat3x2, mat3x3, mat3x4, mat4x2, mat4x3, mat4x4
// 内置函数 https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl-function-reference.html
// 字节对齐参考 https://webgpufundamentals.org/webgpu/lessons/resources/wgsl-offset-computer.html

struct VertexOutPut {
    // position 强制被插值为 @interpolate(perspective, center)
    @builtin(position) position: vec4f,
    // 除了 position 外的信息，在 vertex 后都会被插值生成额外信息给 fragment。称为 Inter-Stage Variables。
    // Inter-Stage 的都需要用@location修饰(依次+1)
    // 如果是单位向量，插值后不再是单位向量了，需要再次 normalize
    @location(0) color: vec4f,
    /*
    插值配置：@interpolate(type, sample)
        插值方法：
            perspective: Values are interpolated in a perspective correct manner (default)
            linear: Values are interpolated in a linear, non-perspective correct manner.
            flat: Values are not interpolated. Interpolation sampling is not used with flat interpolated
        插值采样：
            center: Interpolation is performed at the center of the pixel (default)
            centroid: Interpolation is performed at a point that lies within all the samples covered by the fragment within the current primitive. This value is the same for all samples in the primitive.
            sample: Interpolation is performed per sample. The fragment shader is invoked once per sample when this attribute is applied.
    如果是 integer 类型，则插值方法必须是 flat.
    If you set the interpolation type to flat, the value passed to the fragment shader is the value of the inter-stage variable for the first vertex in that triangle.
    */
    @location(1) texcoord: vec2f,
}

// 可重写的，用于隔离 wgsl 和 js
// 但只支持简单的类型，Texture、Matrix 不支持
override red: f32 = 0.0;

// 绑定到第0个location，的第0个bindGroup
// 类型是storage(GPUBufferUsage.STORAGE)，功能是read_write(GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST)
// storage 可随意读，但写只能在 GPGPU 中写
// array 在js中依然是一个TypedArray,只是offset按照array内容去取(只有最后一个group才能是不定长的)
@group(0) @binding(0) var<storage, read_write> data: array<f32>;

// storage texture
// 不能用 sampler
// 只有 r32float, r32sint, r32uint 可 read_write，其他的只能 read/write (r32: 单色(red)32 bit)
// 只能在GPGPU里用(context.configure.usage |= GPUTextureUsage.STORAGE_BINDING)
@group(0) @binding(0) var storage_tex: texture_storage_2d<rgba8unorm, write>;

// usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
// uniform ≈ var<storage, read>，但 uniform 更快，且有大小限制(算是wgsl的预定义常量)
@group(0) @binding(0) var<uniform> uniformStruct: SomeStruct;

// immediate buffer
// 上限 64bytes，每个 shader 只能有一个
var<immediate> immediates: vec4<u32>;

// texture
// wgl中的texture座标(通常称为UV)是归一化后的[0,1]，左上角为(0,0)
// 纹理的特殊之处在于它们可以被称为采样器的特殊硬件访问。采样器可以用texture中至多16个不同的值采样
// texture 有 texture_external, 1d, 2d, 2d-array, 3d, cube, cube-array。类型具体查文档
// texture_external 没有 mipmap
@group(0) @binding(1) var ourTexture: texture_2d<f32>;

// sampler
@group(0) @binding(0) var ourSampler: sampler;

struct VertexInput {
    // 可以被 IndexBuffer 改变 (GPUBufferUsage.INDEX)
    @builtin(vertex_index) vertexIndex: u32,
    // draw 的第二个参数。vertex 会 per instanceIndex per vertexIndex drawn
    @builtin(instance_index) instanceIndex: u32,
    // GPUBufferUsage.VERTEX
    // VertexBuffer 是顶点的属性(attributes)，比如说位置颜色等，仅能用于 Vertex
    // 通过外部的 attributes 的 shaderLocation 区分 @location
    @location(0) vertBuffer: VertexBuffer,
}

// Vertex 对每次渲染过程调用生成顶点
// 当完成一次最小的图元装配要求后，进行光栅化，GPU 丢弃不需要的渲染的 pixel 后
// 流转至 Fragment
@stage(vertex) fn v_main(
    // 可以展开写，不需要写 struct
    vert: VertexInput
) -> VertexOutPut {
    // Vertex 的座标空间是归一化后的[-1, 1] (和笛卡尔座标一样)
    var pos = array<vec2f, 3>(
        vec2f(0.0, 0.5), // top center
        vec2f(- 0.5, - 0.5), // bottom left
        vec2f(0.5, - 0.5) // bottom right
    );
    var color = array<vec4f, 3>(
        vec4f(1, 0, 0, 1), // red
        vec4f(0, 1, 0, 1), // green
        vec4f(0, 0, 1, 1), // blue
    );
    var vsOutput: VertexOutPut;
    vsOutput.position = vec4f(pos[vertexIndex], 0.0, 1.0);
    vsOutput.color = color[vertexIndex];

    return vsOutput;
}

struct FsOut {
    // 颜色附件。最多 8 个
    // 用于 片元多颜色输出(Multiple Render Targets)
    @location(0) color: vec4f,
    // z 值
    @builtin(frag_depth) depth: f32,
}

// Fragment 对每个"可能的 pixel"(对被遮盖不可见的也会处理，除非开启深度测试)调用
// "pixel" 的位置就由 @builtin(position) 定义
@fragment fn f_main(
    fsInput: VertexOutPut
) -> FsOut {
    // Fragment 中定义的不会被插值
    let red = vec4f(1, 0, 0, 1);
    let cyan = vec4f(0, 1, 1, 1);
    let grid = vec2u(fsInput.position.xy) / 8;  //per 8 pixels
    let checker = (grid.x + grid.y) % 2 == 1;
    // textureSample 是 wgsl 内置函数，用于自定义采样
    // texture_external 不能用这个，只能用 textureSampleBaseClampToEdge 采样
    let sampling = textureSample(ourTexture, ourSampler, fsInput.texcoord);

    if (checker) {
        // 丢弃该 fragment，根本不渲染
        discard;
    }

    // 没有三元运算，select 可以逐通道选择
    return select(red, cyan, checker) * sampling;
}

@compute
// 单组总线程数 = 10 × 2 × 3 = 60 线程
@workgroup_size(10, 2, 3)
fn cs(
    // 当前线程在当前工作组的坐标 x(0-9), y(0-1), z(0-2)
    @builtin(local_invocation_id) lid: vec3u,
    // 当前线程在整个全局所有线程里的坐标
    // global_invocation_id = workgroup_id * workgroup_size + local_invocation_id
    @builtin(global_invocation_id) id : vec3u
) {
    let size = textureDimensions(storage_tex);
    let pos = id.xy;
    // 写入 storage_texture
    textureStore(storage_tex, pos, color);
}

fn func(a: f32) -> bool {
    let a = array<f32, 5>();
    // let 运行时算出，但不能修改
    var count = arrayLength(&a);
    // var 标注显存位置，代表开辟内存，可以修改
    const Pi = 3.14;
    // const 编译期常量替换

    // swizzles 向量重排
    let a = vec4<f32>(1, 2, 3, 4);
    let b = a.zzy;

    var j = 0;
    while (j < 5) {
        j++;
    }

    // wgsl uniq control flows
    var k = 0;
    loop {
        // loop
        k++;
        if (k % 2 == 1) {
            continue;
        }

        // break if
        // 存在，但根本没有人实现
        // break if (k >= 5);

        continuing {
            // continue goes here
        }
    }

    let x = 1;
    // switch 仅支持 u32 和 i32 类型的变量，并且各分支的匹配值必须是常量。
    switch x {
        case 0 : {  // 冒号是可选的
            a = 1;
        }
        default {  // 默认分支不需要出现在最后
            a = 2;
        }
        case 1, 2, {  // 可以使用多个选择值
            a = 3;
        }
        case 3, {  // 尾随逗号也是可选的
            a = 4;
        }
        case 4 {
            a = 5;
        }
    }

    k++; // 递增是语句，不返回值
    k += 1; // +=, -= 也是语句

    _ = vec2f();    // _ 是个特殊变量，可以赋值给它，来让某些东西看起来被使用了，但实际上并不使用它
}
