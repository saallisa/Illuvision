
import { LambertMaterial } from '../lambert-material.js';
import { Material } from '../material.js';
import { ShaderRenderer } from './shader-renderer.js';

import {
    VERTEX_FUNCTION_COLOR,
    VERTEX_FUNCTION_NONE,
    VERTEX_OUTPUT_COLOR,
    VERTEX_OUTPUT_NONE,
    CAMERA_UNIFORM,
    MODEL_UNIFORM,
    CAMERA_UNIFORM_BIND,
    MODEL_UNIFORM_BIND
} from './parts/common.js';

import {
    AMBIENT_LIGHT,
    DIRECTIONAL_LIGHT,
    AMBIENT_STORAGE_BIND,
    DIRECTIONAL_STORAGE_BIND
} from './parts/lights.js';

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

// Fragment stage functions

const FRAGMENT_FUNCTION_START_COLOR = /*wgsl*/ `
@fragment
fn fragment_main(data: VertexOut) -> @location(0) vec4<f32> {
    var end_color = data.vertex_color;`;

const FRAGMENT_FUNCTION_START_UNIFORM = /*wgsl*/ `
@fragment
fn fragment_main(data: VertexOut) -> @location(0) vec4<f32> {
    var end_color = material.color;`;

const FRAGMENT_FUNCTION_START_BLEND = /*wgsl*/ `
@fragment
fn fragment_main(data: VertexOut) -> @location(0) vec4<f32> {
    var end_color = mix(
        material.color,
        data.vertex_color,
        material.blend
    );`;

const FRAGMENT_FUNCTION_END = /*wgsl*/ `
    var light_result = vec3<f32>(0.0, 0.0, 0.0);

    // Ambient light
    let ambient = ambient_light.color * ambient_light.intensity;
    light_result += ambient;

    // Directional lights
    let lightCount: u32 = arrayLength(&directional_lights);
    let vertexNormal = normalize(data.vertex_normal);

    for (var i: u32 = 0; i < lightCount; i++) {
        let light_direction = normalize(directional_lights[i].direction);
        let light_color = directional_lights[i].color;
        let light_intensity = directional_lights[i].intensity;

        let diffuse = max(0.0, dot(vertexNormal, light_direction));
        light_result += light_color * light_intensity * diffuse;
    }
    
    return vec4<f32> (end_color.rgb * light_result, end_color.a);
}`;

/**
 * This class creates a vertex and fragment shader for the lambert material.
 * It can use uniform colors, vertex colors or a blend between both.
 */
class LambertShader extends ShaderRenderer
{
    #mode;

    constructor(mode = Material.UNIFORM_COLOR)
    {
        super();
        
        LambertMaterial.validateColorMode(mode);
        this.#mode = mode;
    }

    /**
     * Renders a basic vertex shader WGSL code.
     */
    renderVertexCode()
    {
        let vertexColorLine = '';
        
        if (this.#mode === Material.VERTEX_COLOR
            || this.#mode === Material.COLOR_BLEND
        ) {
            vertexColorLine = 'output.vertex_color = color;';
        }

        const vertexOutput = this.getVertexOutputStruct();
        const vertexFunction = this.getVertexFunction();
        
        return /*wgsl*/ `
        ${vertexOutput}
        
        ${CAMERA_UNIFORM}
        ${MODEL_UNIFORM}

        ${CAMERA_UNIFORM_BIND}
        ${MODEL_UNIFORM_BIND}
        
        ${vertexFunction}
            var output : VertexOut;
            
            var position4 = vec4<f32> (position, 1);
            var world_position = model.model_matrix * position4;
            var view_position = camera.view * world_position;
            
            output.position = camera.projection * view_position;
            output.vertex_position = (model.model_matrix * position4).xyz;
            output.vertex_normal = model.normal_matrix * normal;
            ${vertexColorLine}
        
            return output;
        }`;
    }

    /**
     * Renders a basic fragment shader WGSL code.
     */
    renderFragmentCode()
    {
        let vertexOutput = '';
        let materialUniform = '';
        let materialUniformBinding = '';
        let fragmentFunction = '';

        if (this.#mode === Material.UNIFORM_COLOR) {
            vertexOutput = VERTEX_OUTPUT_NONE;
            materialUniform = MATERIAL_UNIFORM_COLOR;
            materialUniformBinding = MATERIAL_UNIFORM_BINDING;
            fragmentFunction = FRAGMENT_FUNCTION_START_UNIFORM;
        }

        if (this.#mode === Material.COLOR_BLEND) {
            vertexOutput = VERTEX_OUTPUT_COLOR;
            materialUniform = MATERIAL_UNIFORM_BLEND;
            materialUniformBinding = MATERIAL_UNIFORM_BINDING;
            fragmentFunction = FRAGMENT_FUNCTION_START_BLEND;
        }

        if (this.#mode === Material.VERTEX_COLOR) {
            vertexOutput = VERTEX_OUTPUT_COLOR;
            fragmentFunction = FRAGMENT_FUNCTION_START_COLOR;
        }

        return /*wgsl*/ `
        ${vertexOutput}
    
        ${materialUniform}
        ${AMBIENT_LIGHT}
        ${DIRECTIONAL_LIGHT}
        
        ${materialUniformBinding}
        ${AMBIENT_STORAGE_BIND}
        ${DIRECTIONAL_STORAGE_BIND}

        ${fragmentFunction}
        ${FRAGMENT_FUNCTION_END}`;
    }

    /**
     * Finds the right vertex output struct to use in the vertex shader.
     */
    getVertexOutputStruct()
    {
        if (this.#mode === Material.VERTEX_COLOR
            || this.#mode === Material.COLOR_BLEND
        ) {
            return VERTEX_OUTPUT_COLOR;
        }
        
        return VERTEX_OUTPUT_NONE;
    }

    /**
     * Finds the right vertex function signature to use in the vertex shader.
     */
    getVertexFunction()
    {
        if (this.#mode === Material.VERTEX_COLOR
            || this.#mode === Material.COLOR_BLEND
        ) {
            return VERTEX_FUNCTION_COLOR;
        }

        return VERTEX_FUNCTION_NONE;
    }

    /**
     * Finds the right fragment function to use in the fragment shader.
     */
    getMaterialFunction()
    {
        if (this.#mode === Material.UNIFORM_COLOR) {
            return MATERIAL_UNIFORM_COLOR;
        }

        if (this.#mode === Material.COLOR_BLEND) {
            return MATERIAL_UNIFORM_BLEND;
        }

        return '';
    }

    /**
     * Builds a shader with the provided color mode.
     */
    static createShader(mode)
    {
        const shaderRenderer = new LambertShader(mode);
        return shaderRenderer.getShader();
    }
}

export {
    LambertShader
};