
struct VertexOut {
    @builtin(position) position : vec4<f32>
}

@vertex
fn vertex_main(
    @location(0) position: vec4<f32>
) -> VertexOut {
    var output : VertexOut;
    output.position = position;
    return output;
}
