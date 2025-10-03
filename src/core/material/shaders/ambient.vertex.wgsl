
struct VertexOut {
    @builtin(position) position: vec4<f32>,
    @location(0) vertex_position: vec3<f32>,
    @location(1) vertex_normal: vec3<f32>
}

struct CameraUniforms {
    projection: mat4x4<f32>,
    view: mat4x4<f32>
}

struct ModelUniforms {
    model_matrix: mat4x4<f32>,
    normal_matrix: mat3x3<f32>
}

@group(0) @binding(0) var<uniform> camera: CameraUniforms;
@group(3) @binding(0) var<uniform> model: ModelUniforms;

@vertex
fn vertex_main(
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>
) -> VertexOut {
    var output : VertexOut;
    
    var position4 = vec4<f32> (position, 1.0);
    var world_position = model.model_matrix * position4;
    var view_position = camera.view * world_position;
    
    output.position = camera.projection * view_position;
    output.vertex_position = (model.model_matrix * position4).xyz;
    output.vertex_normal = model.normal_matrix * normal;

    return output;
}