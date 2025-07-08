
import { Color } from '../color.js';
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
     * Makes sure that the material's name is valid
     */
    static #validateName(name)
    {
        if (typeof name !== 'string' || name.trim().length === 0) {
            throw new TypeError('Material name must be a non-empty string');
        }
    }
}