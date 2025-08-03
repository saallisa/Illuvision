
struct AmbientLight {
    color: vec3<f32>,
    _padding: f32,
    intensity: f32
}

struct MaterialUniforms {
    color: vec4<f32>
}

@group(1) @binding(0) var<uniform> ambient_light: AmbientLight;
@group(2) @binding(0) var<uniform> material: MaterialUniforms;

@fragment
fn fragment_main() -> @location(0) vec4<f32> {
    var colorMix = mix(
        material.color,
        vec4<f32> (ambient_light.color, 1),
        ambient_light.intensity / 2
    );

    return colorMix * ambient_light.intensity;
}