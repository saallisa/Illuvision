
struct VertexOut {
    @builtin(position) position : vec4<f32>
}

struct CameraUniforms {
    projection: mat4x4<f32>,
    view: mat4x4<f32>
}

struct ModelUniforms {
    matrix: mat4x4<f32>
}

@group(0) @binding(0) var<uniform> camera: CameraUniforms;
@group(3) @binding(0) var<uniform> model: ModelUniforms;

@vertex
fn vertex_main(
    @location(0) position: vec4<f32>
) -> VertexOut {
    var output : VertexOut;
    
    var world_position = model.matrix * position;
    var view_position = camera.view * world_position;
    
    output.position = camera.projection * view_position;
    
    return output;
}
