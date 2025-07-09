
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
     * Returns the uniform data as a Float32Array so it can be fed into a
     * WebGPU uniform buffer.
     */
    flattenUniforms()
    {
        const flatUniforms = [];

        for (const value of this.#uniforms) {
            if (Array.isArray(value)) {
                flatUniforms.push(...value);
            } else {
                flatUniforms.push(value);
            }
        }

        return new Float32Array(flatUniforms);
    }

    /**
     * Compiles the material by creating the WebGPU buffers.
     */
    compile(device)
    {
        if (this.#compiled) {
            return;
        }

        Engine.validateDevice(device);

        this.#createUniformBuffer(device);
        this.#compiled = true;
    }

    /**
     * Destroys WebGPU buffers associated with this material.
     */
    destroy()
    {
        if (this.#uniformBuffer) {
            this.#uniformBuffer.destroy();
            this.#uniformBuffer = null;
        }

        this.#compiled = false;
    }

    /**
     * Creates a uniform buffer for the current uniforms of the material.
     */
    #createUniformBuffer(device)
    {
        const flatUniforms = this.flattenUniforms();

        this.#uniformBuffer = device.createBuffer({
            size: flatUniforms.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        device.queue.writeBuffer(this.#uniformBuffer, 0, flatUniforms);
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
}