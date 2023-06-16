struct VertexOutPut {
    // position 强制被插值为 @interpolate(perspective, center)
    @builtin(position) position: vec4f;
    // 除了 postion 外的信息，在 vertex 后都会被插值生成额外信息给 fragment。称为 Inter-Stage Variables。
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
}

// 绑定到第0个location，的第0个bindGroup
// 类型是storage(GPUBufferUsage.STORAGE)，功能是read_write(GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST)
@group(0) @binding(0) var<storage, read_write> data: array<f32>;

// uniform 相当于wgsl里的全局变量。可以通过js设置修改，并通过wgsl读取
@group(0) @binding(0) var<uniform> uniformStruct: SomeStruct;

// Vertex 对每次渲染过程调用(vertexIndex表识第几次调用)生成顶点，光栅化后 GPU 丢弃不需要的渲染的 pixel
@stage(vertex) fn v_main(
    @builtin(vertex_index) vertexIndex : u32
) -> VertexOutPut {
    // WebGPU的座标空间是标准化后的[-1, 1]
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

    // select = (a, b, cond) => cond ? a : b;
    return select(red, cyan, checker);
}
