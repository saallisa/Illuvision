
struct MaterialUniforms {
    color: vec4<f32>
}

@group(0) @binding(0) var<uniform> material: MaterialUniforms;

@fragment
fn fragment_main() -> @location(0) vec4<f32> {
    return material.color;
}