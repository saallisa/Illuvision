
import { Color } from '../color.js';
import { Engine } from '../../engine.js';
import { Shader } from '../shader.js';

/**
 * Abstract base Material class for WebGPU.
 */
class Material
{
    #name = null;
    #shader = null;
    #color = null;
    #vertexColors = false;
    #uniforms = new Map();
    #uniformLayout = new Map();

    #uniformBuffer = null;
    #compiled = false;

    constructor(name = 'Material')
    {
        if (this.constructor === Material) {
            throw new Error('Material cannot be instantiated directly.');
        }

        Material.#validateName(name);
        this.#name = name;

        this.setColor(Color.WHITE.clone());
    }

    /**
     * Gets the material name.
     */
    getName() {
        return this.#name;
    }

    /**
     * Sets the material name.
     */
    setName(name)
    {
        Material.#validateName(name);

        this.#name = name;
    }

    /**
     * Gets the base color of the material.
     */
    getColor() {
        return this.#color.clone();
    }

    /**
     * Sets the base color of the material.
     */
    setColor(color)
    {
        if (!(color instanceof Color)) {
            throw new TypeError('Color must be an instance of Color class.');
        }

        this.#color = color.clone();
        this.setUniform('color', this.#color.toArray(), 'vec4<f32>');
    }

    /**
     * Configures the material to use vertex colors instead of uniform colors.
     */
    setUseVertexColor(config)
    {
        if (typeof config !== 'boolean') {
            throw new TypeError('Value must be of type boolean.');
        }

        this.#vertexColors = config;
    }

    /**
     * Returns whether a material should use a uniform color value or the vertex
     * color values.
     */
    getUseVertexColor() {
        return this.#vertexColors;
    }

    /**
     * Gets the shader associated with this material.
     */
    getShader() {
        return this.#shader;
    }

    /**
     * Sets the shader for this material.
     */
    setShader(shader)
    {
        if (!(shader instanceof Shader)) {
            throw new TypeError('Shader must be a valid Shader instance.');
        }

        this.#shader = shader;
    }

    /**
     * Sets a uniform value for the material.
     */
    setUniform(name, value, type)
    {
        if (typeof name !== 'string' || name.trim().length === 0) {
            throw new TypeError('Uniform name must be a non-empty string.');
        }

        Material.#validateUniformValue(value);
        Material.#validateUniformType(type);

        this.#uniforms.set(name, value);
        this.#uniformLayout.set(name, type);
    }

    /**
     * Gets a uniform value by name.
     */
    getUniform(name) {
        return this.#uniforms.get(name);
    }

    /**
     * Gets a copy of all uniforms as a map.
     */
    getUniforms() {
        return new Map(this.#uniforms);
    }

    /**
     * Gets a copy of the uniform layout map.
     */
    getUniformLayout() {
        return new Map(this.#uniformLayout);
    }

    /**
     * Removes a uniform by name.
     */
    removeUniform(name)
    {
        this.#uniforms.delete(name);
        this.#uniformLayout.delete(name);
    }

    /**
     * Clears all uniforms.
     */
    clearUniforms() {
        this.#uniforms.clear();
        this.#uniformLayout.clear();
    }

    /**
     * Retrieve the uniform buffer.
     */
    getUniformBuffer()
    {
        if (!this.#compiled) {
            throw new Error(
                'Material must be compiled before accessing uniform buffer!'
            );
        }

        return this.#uniformBuffer;
    }

    /**
     * Updates the uniform buffer with current uniform values.
     */
    updateUniformBuffer(device)
    {
        if (!this.#compiled) {
            throw new Error(
                'Material must be compiled before updating uniform buffer!'
            );
        }

        Engine.validateDevice(device);

        const flatUniforms = this.flattenUniforms();

        if (flatUniforms.byteLength > this.#uniformBuffer.size) {
            this.#uniformBuffer.destroy();
            this.#createUniformBuffer(device);
        } else {
            device.queue.writeBuffer(this.#uniformBuffer, 0, flatUniforms);
        }
    }

    /**
     * Returns the uniform data as a Float32Array so it can be fed into a
     * WebGPU uniform buffer.
     */
    flattenUniforms()
    {
        const flatUniforms = [];

        for (const value of this.#uniforms.values()) {
            if (Array.isArray(value)) {
                flatUniforms.push(...value);
            } else {
                flatUniforms.push(value);
            }
        }

        return new Float32Array(flatUniforms);
    }

    /**
     * Compiles the material by creating the WebGPU shader and buffers.
     */
    compile(device)
    {
        if (this.#compiled) {
            return;
        }

        if (!this.#shader) {
            throw new Error('Need to set a shader before compilation!');
        }

        Engine.validateDevice(device);

        this.#shader.compile(device);
        this.#createUniformBuffer(device);
        this.#compiled = true;
    }

    /**
     * Returns if the material is compiled.
     */
    isCompiled() {
        return this.#compiled;
    }

    /**
     * Destroys WebGPU shader and buffers associated with this material.
     */
    destroy()
    {
        if (this.#uniformBuffer) {
            this.#uniformBuffer.destroy();
            this.#uniformBuffer = null;
        }

        if (this.#shader) {
            this.#shader.destroy();
        }

        this.#compiled = false;
    }

    /**
     * Creates a uniform buffer for the current uniforms of the material.
     */
    #createUniformBuffer(device)
    {
        const flatUniforms = this.flattenUniforms();
        const bufferSize = Math.max(flatUniforms.byteLength, 16);

        this.#uniformBuffer = device.createBuffer({
            size: bufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        if (flatUniforms.byteLength > 0) {
            device.queue.writeBuffer(this.#uniformBuffer, 0, flatUniforms);
        }
    }

    /**
     * Makes sure that the material's name is valid
     */
    static #validateName(name)
    {
        if (typeof name !== 'string' || name.trim().length === 0) {
            throw new TypeError('Material name must be a non-empty string');
        }
    }

    /**
     * Validates a uniform value to ensure it is only a finite number or an
     * array of finite numbers.
     */
    static #validateUniformValue(value)
    {
        if (value === null || value === undefined) {
            throw new TypeError('Uniform value may not be empty!');
        }

        if (typeof value === 'number') {
            if (!isFinite(value)) {
                throw new TypeError('Uniform number value must be finite!');
            }
            return;
        }

        if (Array.isArray(value)) {
            for (const element of value.values()) {
                if (element === null || element === undefined) {
                    throw new TypeError(
                        'Uniform array value may not contain empty values!'
                    );
                }

                if (typeof element === 'number') {
                    if (!isFinite(element)) {
                        throw new TypeError(
                            'Uniform array value must be a finite number!'
                        );
                    }
                }
            }
            return;
        }

        throw new TypeError(
            'Uniform value must be a finite number or array!'
        );
    }

    /**
     * Validates that a uniform type is a valid WGSL type.
     */
    static #validateUniformType(type)
    {
        const validTypes = [
            // Scalar types
            'f32', 'i32', 'u32', 'bool',

            // Vector types
            'vec2<f32>', 'vec2<i32>', 'vec2<u32>', 'vec2<bool>',
            'vec3<f32>', 'vec3<i32>', 'vec3<u32>', 'vec3<bool>',
            'vec4<f32>', 'vec4<i32>', 'vec4<u32>', 'vec4<bool>',

            // Matrix types
            'mat2x2<f32>', 'mat2x3<f32>', 'mat2x4<f32>',
            'mat3x2<f32>', 'mat3x3<f32>', 'mat3x4<f32>',
            'mat4x2<f32>', 'mat4x3<f32>', 'mat4x4<f32>',

            // Common shorthand aliases
            'float', 'int', 'uint',
            'vec2', 'vec3', 'vec4',
            'mat2', 'mat3', 'mat4',
            'mat2x2', 'mat3x3', 'mat4x4'
        ];

        if (!validTypes.includes(type)) {
            throw new TypeError(
                `Invalid uniform type '${type}'. Must be a valid WGSL type.`
            );
        }
    }
}

export {
    Material
};