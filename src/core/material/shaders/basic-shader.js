
import { BasicMaterial } from '../basic-material.js';
import { Shader } from '../../shader.js';

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

// Vertex stage functions

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

// Material uniforms

const MATERIAL_UNIFORM_COLOR = /*wgsl*/ `
struct MaterialUniforms {
    color: vec4<f32>
}`;

const MATERIAL_UNIFORM_BLEND = /*wgsl*/ `
struct MaterialUniforms {
    color: vec4<f32>,
    blend: f32
}
`;

const MATERIAL_UNIFORM_BINDING = /*wgsl*/ `
@group(2) @binding(0) var<uniform> material: MaterialUniforms;
`;

// Fragment stage functions

const FRAGMENT_FUNCTION_COLOR = /*wgsl*/ `
@fragment
fn fragment_main(data: VertexOut) -> @location(0) vec4<f32> {
    return data.vertex_color;
}`;

const FRAGMENT_FUNCTION_UNIFORM = /*wgsl*/ `
@fragment
fn fragment_main() -> @location(0) vec4<f32> {
    return material.color;
}`;

const FRAGMENT_FUNCTION_BLEND = /*wgsl*/ `
@fragment
fn fragment_main(data: VertexOut) -> @location(0) vec4<f32> {
    return mix(
        material.color,
        data.vertex_color,
        material.blend
    );
}`;

/**
 * This class creates a vertex and fragment shader for the basic material.
 * It can use uniform colors, vertex colors or a blend between both.
 */
class BasicShader
{
    #mode;

    constructor(mode = BasicMaterial.UNIFORM_COLOR)
    {
        BasicMaterial.validateColorMode(mode);
        this.#mode = mode;
    }

    /**
     * Renders a basic vertex shader WGSL code.
     */
    renderVertexCode()
    {
        let vertexColorLine = '';
        
        if (this.#mode === BasicMaterial.VERTEX_COLOR
            || this.#mode === BasicMaterial.COLOR_BLEND
        ) {
            vertexColorLine = 'output.vertex_color = color;';
        }

        const vertexOutput = this.getVertexOutputStruct();
        const vertexFunction = this.getVertexFunction();
        
        return /*wgsl*/ `
        ${vertexOutput}
        
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

        if (this.#mode === BasicMaterial.UNIFORM_COLOR) {
            vertexOutput = VERTEX_OUTPUT_NONE;
            materialUniform = MATERIAL_UNIFORM_COLOR;
            materialUniformBinding = MATERIAL_UNIFORM_BINDING;
            fragmentFunction = FRAGMENT_FUNCTION_UNIFORM;
        }

        if (this.#mode === BasicMaterial.COLOR_BLEND) {
            vertexOutput = VERTEX_OUTPUT_COLOR;
            materialUniform = MATERIAL_UNIFORM_BLEND;
            materialUniformBinding = MATERIAL_UNIFORM_BINDING;
            fragmentFunction = FRAGMENT_FUNCTION_BLEND;
        }

        if (this.#mode === BasicMaterial.VERTEX_COLOR) {
            vertexOutput = VERTEX_OUTPUT_COLOR;
            fragmentFunction = FRAGMENT_FUNCTION_COLOR;
        }

        return /*wgsl*/ `
        ${vertexOutput}
        ${materialUniform}
        
        ${materialUniformBinding}
        ${fragmentFunction}
        `;
    }

    /**
     * Finds the right vertex output struct to use in the vertex shader.
     */
    getVertexOutputStruct()
    {
        if (this.#mode === BasicMaterial.VERTEX_COLOR
            || this.#mode === BasicMaterial.COLOR_BLEND
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
        if (this.#mode === BasicMaterial.VERTEX_COLOR
            || this.#mode === BasicMaterial.COLOR_BLEND
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
        if (this.#mode === BasicMaterial.UNIFORM_COLOR) {
            return MATERIAL_UNIFORM_COLOR;
        }

        if (this.#mode === BasicMaterial.COLOR_BLEND) {
            return MATERIAL_UNIFORM_BLEND;
        }

        return '';
    }

    /**
     * Creates a shader object from this basic shader renderer.
     */
    getShader()
    {
        return new Shader(
            this.renderVertexCode(),
            this.renderFragmentCode()
        );
    }

    /**
     * Builds a shader with the provided color mode.
     */
    static createShader(mode)
    {
        const shaderRenderer = new BasicShader(mode);
        return shaderRenderer.getShader();
    }
}

export {
    BasicShader
};