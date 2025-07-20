
import { Color } from '../color.js';
import { Engine } from '../../engine.js';
import { Shader } from '../shader.js';
import { UniformBuffer } from '../buffer/uniform-buffer.js';

/**
 * Abstract base Material class for WebGPU.
 */
class Material
{
    #name = null;
    #shader = null;
    #color = null;
    #vertexColors = false;

    #uniformBuffer = null;
    #compiled = false;

    constructor(name = 'Material')
    {
        if (this.constructor === Material) {
            throw new Error('Material cannot be instantiated directly.');
        }

        Material.#validateName(name);
        this.#name = name;

        this.#uniformBuffer = new UniformBuffer();
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
        this.#uniformBuffer.setUniform(
            'color', this.#color.toArray(), 'vec4<f32>'
        );
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
        this.#uniformBuffer.compile(device);
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
        if (this.#uniformBuffer.isCompiled()) {
            this.#uniformBuffer.destroy();
        }

        if (this.#shader) {
            this.#shader.destroy();
        }

        this.#compiled = false;
    }

    /**
     * Abstract method for initializing this material. Must be implemented
     * by the concrete implementation of this class.
     */
    static async init(settings = {}) {
        throw new Error('Method init not implemented!');
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

export {
    Material
};