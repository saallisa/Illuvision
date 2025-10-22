
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
    #id = null;
    #shader = null;
    #color = null;
    #cullMode = 'none';
    #vertexColors = false;

    #uniformBuffer = null;
    #bindGroupLayout = null;
    #bindGroup = null;
    #compiled = false;

    constructor(name = 'material')
    {
        if (this.constructor === Material) {
            throw new Error('Material cannot be instantiated directly.');
        }

        Material.#validateName(name);
        this.#name = name;
        this.#id = crypto.randomUUID();

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
     * Gets the universally unique identifier of this material.
     */
    getId() {
        return this.#id;
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
     * Gets the cull mode of this material. Either front, back or none.
     */
    getCullMode() {
        return this.#cullMode;
    }

    /**
     * Sets the cull mode of this material. Either front, back or none.
     */
    setCullMode(cullMode)
    {
        this.#validateCullMode(cullMode);
        this.#cullMode = cullMode;
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
     * Gets the bind group layout of this material.
     */
    getBindGroupLayout()
    {
        if (!this.#compiled) {
            throw new Error(
                'Material must be compiled before accessing bind group layout.'
            );
        }

        return this.#bindGroupLayout;
    }

    /**
     * Gets the bind group of this material.
     */
    getBindGroup()
    {
        if (!this.#compiled) {
            throw new Error(
                'Material must be compiled before accessing bind group.'
            );
        }

        return this.#bindGroup;
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
        this.#createBindGroup(device);
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

        this.#bindGroup = null;
        this.#bindGroupLayout = null;

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
     * Creates the bind group layout.
     */
    #createBindGroup(device)
    {
        this.#bindGroupLayout = device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                buffer: {},
            }]
        });

        this.#bindGroup = device.createBindGroup({
            label: this.#name + '-material',
            layout: this.#bindGroupLayout,
            entries: [{
                binding: 0,
                resource: {
                    buffer: this.#uniformBuffer.getUniformBuffer()
                }
            }]
        });
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
     * Validates a cull mode.
     */
    #validateCullMode(cullMode)
    {
        const validModes = [
            Material.CULL_BACK,
            Material.CULL_BACK,
            Material.CULL_FRONT
        ];

        if (!validModes.includes(cullMode)) {
            throw new Error(
                `Invalid face culling mode: ${cullMode}.`
            );
        }
    }

    // Some fake constants containing valid culling modes.

    static get CULL_FRONT() {
        return 'front';
    }

    static get CULL_BACK() {
        return 'back';
    }

    static get CULL_NONE() {
        return 'none';
    }
}

export {
    Material
};