
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
    #uniforms = new Map();

    #uniformBuffer = null;
    #compiled = false;

    constructor(name = 'Material')
    {
        if (this.constructor === Material) {
            throw new Error('Material cannot be instantiated directly.');
        }

        Material.#validateName(name);
        this.#name = name;

        this.#color = Color.WHITE.clone();
        this.setUniform('color', this.#color.toArray());
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
        this.setUniform('color', this.#color.toArray());
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
    setUniform(name, value)
    {
        if (typeof name !== 'string' || name.trim().length === 0) {
            throw new TypeError('Uniform name must be a non-empty string.');
        }

        Material.#validateUniformValue(value);
        this.#uniforms.set(name, value);
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
     * Removes a uniform by name.
     */
    removeUniform(name) {
        return this.#uniforms.delete(name);
    }

    /**
     * Clears all uniforms.
     */
    clearUniforms() {
        this.#uniforms.clear();
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
        }

        throw new TypeError(
            'Uniform value must be a finite number or array!'
        );
    }
}

export {
    Material
};