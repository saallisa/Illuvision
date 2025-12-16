
// Vertex output structs

const VERTEX_OUTPUT_COLOR = /*wgsl*/ `
struct VertexOut {
    @builtin(position) position: vec4<f32>,
    @location(0) vertex_position: vec3<f32>,
    @location(1) vertex_normal: vec3<f32>,
    @location(2) vertex_color: vec4<f32>
}`;

const VERTEX_OUTPUT_NONE = /*wgsl*/ `
struct VertexOut {
    @builtin(position) position: vec4<f32>,
    @location(0) vertex_position: vec3<f32>,
    @location(1) vertex_normal: vec3<f32>
}`;

// Position and normal calculation uniforms

const CAMERA_UNIFORM = /*wgsl*/ `
struct CameraUniforms {
    projection: mat4x4<f32>,
    view: mat4x4<f32>
}`;

const MODEL_UNIFORM = /*wgsl*/ `
struct ModelUniforms {
    model_matrix: mat4x4<f32>,
    model_view_matrix: mat4x4<f32>,
    normal_matrix: mat3x3<f32>
}`;

const CAMERA_UNIFORM_BIND = /*wgsl*/ `
@group(0) @binding(0) var<uniform> camera: CameraUniforms;`;

const MODEL_UNIFORM_BIND = /*wgsl*/ `
@group(3) @binding(0) var<uniform> model: ModelUniforms;`;

// Vertex stage function signatures

const VERTEX_FUNCTION_COLOR = /*wgsl*/ `
@vertex
fn vertex_main(
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) color: vec4<f32>
) -> VertexOut {`;

const VERTEX_FUNCTION_NONE =  /*wgsl*/ `
@vertex
fn vertex_main(
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>
) -> VertexOut {`;

export {
    VERTEX_OUTPUT_COLOR,
    VERTEX_OUTPUT_NONE,
    VERTEX_FUNCTION_COLOR,
    VERTEX_FUNCTION_NONE,
    CAMERA_UNIFORM,
    MODEL_UNIFORM,
    CAMERA_UNIFORM_BIND,
    MODEL_UNIFORM_BIND
};