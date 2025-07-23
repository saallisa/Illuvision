
struct VertexOut {
    @builtin(position) position : vec4<f32>
}

struct CameraUniforms {
    matrix: mat4x4<f32>
}

struct ModelUniforms {
    matrix: mat4x4<f32>
}

@group(0) @binding(1) var<uniform> camera: CameraUniforms;
@group(1) @binding(1) var<uniform> model: ModelUniforms;

@vertex
fn vertex_main(
    @location(0) position: vec4<f32>
) -> VertexOut {
    var output : VertexOut;
    output.position = model.matrix * position * camera.matrix;
    return output;
}
