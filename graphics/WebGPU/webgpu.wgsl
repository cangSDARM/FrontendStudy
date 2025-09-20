// WGSL 没有像 lowp 这样的精度说明符, 而是显式指定具体类型，例如 f32
// 基本数字类型：f32 / f, u32 / u, i32 / i, f16 / h
// 基本向量类型：vec2<num> / vec2f, vec3, vec4
// 基本矩阵类型：mat2x2<num> / mat2x2u, mat2x3, mat2x4, mat3x2, mat3x3, mat3x4, mat4x2, mat4x3, mat4x4

struct VertexOutPut {
    // position 强制被插值为 @interpolate(perspective, center)
    @builtin(position) position: vec4f;
    // 除了 position 外的信息，在 vertex 后都会被插值生成额外信息给 fragment。称为 Inter-Stage Variables。
    // Inter-Stage 的都需要用@location修饰(依次+1)
    @location(0) color: vec4f;
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
    @location(1) texcoord: vec2f;
}

// 可重写的，用于隔离 wgsl 和 js
// 但只支持简单的类型，Texture、Matrix 不支持
override red: f32 = 0.0;

// 绑定到第0个location，的第0个bindGroup
// 类型是storage(GPUBufferUsage.STORAGE)，功能是read_write(GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST)
// storage可修改，但只能GPGPU中修改
// array 在js中依然是一个TypedArray,只是offset按照array内容去取
@group(0) @binding(0) var<storage, read_write> data: array<f32>;

// usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
// uniform ≈ var<storage, read>，但uniform更快，而大小限制更严格
@group(0) @binding(0) var<uniform> uniformStruct: SomeStruct;

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
    @builtin(vertex_index) vertexIndex : u32,
    // draw 的第二个参数。vertex 会 per instanceIndex per vertexIndex drawn
    @builtin(instance_index) instanceIndex: u32,
    // GPUBufferUsage.VERTEX
    // VertexBuffer 仅能用于 Vertex，现代GPU通过硬编码模拟实现。需要时能以uniform替代则使用uniform
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
    // var == variable; let == const
    var pos = array<vec2f, 3>(
        vec2f( 0.0,  0.5),  // top center
        vec2f(-0.5, -0.5),  // bottom left
        vec2f( 0.5, -0.5)   // bottom right
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

// Fragment 对每个"可能的 pixel"(对被遮盖不可见的也会处理，除非开启深度测试)调用
// "pixel" 的位置就由 @builtin(position) 定义
@fragment fn f_main(
    fsInput: VertexOutPut
) -> 
// @location(0) 表识会返回给第0个渲染对象
@location(0) vec4f {
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

    // 没有三元运算，select = (a, b, cond) => cond ? a : b;
    return select(red, cyan, checker) * sampling;
}
