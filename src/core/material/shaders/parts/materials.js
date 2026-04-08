
// Material uniforms

const MATERIAL_UNIFORM_COLOR = /*wgsl*/ `
struct MaterialUniforms {
    color: vec4<f32>
}`;

const MATERIAL_UNIFORM_BLEND = /*wgsl*/ `
struct MaterialUniforms {
    color: vec4<f32>,
    blend: f32
}`;

const MATERIAL_UNIFORM_BINDING = /*wgsl*/ `
@group(2) @binding(0) var<uniform> material: MaterialUniforms;`;

// Texture bindings

const TEXTURE_BIND = /*wgsl*/ `
@group(2) @binding(1) var mat_sampler: sampler;
@group(2) @binding(2) var mat_texture: texture_2d<f32>;`;

export {
    MATERIAL_UNIFORM_COLOR,
    MATERIAL_UNIFORM_BLEND,
    MATERIAL_UNIFORM_BINDING,
    TEXTURE_BIND
};