
// Light type structs

const AMBIENT_LIGHT = /*wgsl*/ `
struct AmbientLight {
    color: vec3<f32>,
    _padding: f32,
    intensity: f32
}`;

const DIRECTIONAL_LIGHT = /*wgsl*/ `
struct DirectionalLight {
    direction: vec3<f32>,
    _padding: f32,
    color: vec3<f32>,
    _padding2: f32,
    intensity: f32
}`;

const AMBIENT_STORAGE_BIND = /*wgsl*/ `
@group(1) @binding(0) var<uniform> ambient_light: AmbientLight;`;

const DIRECTIONAL_STORAGE_BIND = /*wgsl*/ `
@group(1) @binding(1) var<storage, read> directional_lights: array<DirectionalLight>;`;

export {
    AMBIENT_LIGHT,
    DIRECTIONAL_LIGHT,
    AMBIENT_STORAGE_BIND,
    DIRECTIONAL_STORAGE_BIND
};