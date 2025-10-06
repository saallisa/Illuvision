
struct VertexOut {
    @builtin(position) position: vec4<f32>,
    @location(0) vertex_position: vec3<f32>,
    @location(1) vertex_normal: vec3<f32>
}

struct AmbientLight {
    color: vec3<f32>,
    _padding: f32,
    intensity: f32
}

struct DirectionalLight {
    direction: vec3<f32>,
    _padding: f32,
    color: vec3<f32>,
    _padding2: f32,
    intensity: f32
}

struct MaterialUniforms {
    color: vec4<f32>
}

@group(1) @binding(0) var<uniform> ambient_light: AmbientLight;
@group(1) @binding(1) var<storage, read> directional_lights: array<DirectionalLight>;
@group(2) @binding(0) var<uniform> material: MaterialUniforms;

@fragment
fn fragment_main(data: VertexOut) -> @location(0) vec4<f32> {
    var light_result = vec3<f32>(0.0, 0.0, 0.0);

    // Ambient light
    let ambient = ambient_light.color * ambient_light.intensity;
    light_result += ambient;

    // Directional light
    let lightCount: u32 = arrayLength(&directional_lights);
    let vertexNormal = normalize(data.vertex_normal);

    for (var i: u32 = 0; i < lightCount; i++) {
        let light_direction = normalize(directional_lights[i].direction - data.vertex_position);
        let light_color = directional_lights[i].color;
        let light_intensity = directional_lights[i].intensity;

        let diffuse = max(0.0, dot(vertexNormal, light_direction));
        light_result += light_color * light_intensity * diffuse;
    }
    
    return vec4<f32> (material.color.rgb * light_result, material.color.a);
}