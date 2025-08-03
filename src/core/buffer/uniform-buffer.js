
import { BaseBuffer } from './base-buffer.js';
import { Engine } from '../../engine.js';

/**
 * Manages WebGPU uniform buffers with automatic resizing and validation.
 */
class UniformBuffer extends BaseBuffer
{
    #uniforms = new Map();
    #uniformLayout = new Map();
    #alignedUniformSize = 0;
    #fieldOffsets = new Map();

    #aligned = true;
    #uniformBuffer = null;
    #compiled = false;

    constructor(aligned = true)
    {
        super();

        this.#aligned = aligned;
    }

    /**
     * Sets a uniform value.
     */
    setUniform(name, value, type)
    {
        if (typeof name !== 'string' || name.trim().length === 0) {
            throw new TypeError('Uniform name must be a non-empty string.');
        }

        UniformBuffer.validateBufferValue(value);
        UniformBuffer.validateBufferValueType(type);

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
    clearUniforms()
    {
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
                'Uniform uffer must be compiled before accessing it!'
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
                'Uniform buffer must be compiled before updating!'
            );
        }

        Engine.validateDevice(device);

        this.#calculateAligned();

        const flatUniforms = this.#flattenUniforms();

        if (flatUniforms.byteLength > this.#uniformBuffer.size) {
            this.#uniformBuffer.destroy();
            this.#createUniformBuffer(device);
        } else {
            device.queue.writeBuffer(this.#uniformBuffer, 0, flatUniforms);
        }
    }

    /**
     * Compiles the uniform buffer.
     */
    compile(device)
    {
        if (this.#compiled) {
            return;
        }

        Engine.validateDevice(device);

        this.#calculateAligned();
        this.#createUniformBuffer(device);
        this.#compiled = true;
    }

    /**
     * Returns if the uniform buffer is compiled.
     */
    isCompiled() {
        return this.#compiled;
    }

    /**
     * Destroys the WebGPU buffer.
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
     * Calculates the alignment and offsets for this uniform buffer.
     */
    #calculateAligned()
    {
        if (this.#aligned) {
            // Calculate proper aligned size and field offsets
            this.#alignedUniformSize = UniformBuffer.calculateStructSize(
                Object.fromEntries(this.#uniformLayout)
            );
            this.#fieldOffsets = UniformBuffer.calculateFieldOffsets(
                Object.fromEntries(this.#uniformLayout)
            );
        }
    }

    /**
     * Creates a uniform buffer for the current uniforms.
     */
    #createUniformBuffer(device)
    {
        const flatUniforms = this.#flattenUniforms();
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
     * Flattens the uniforms according to the rules set at buffer creation.
     */
    #flattenUniforms()
    {
        if (this.#aligned) {
            const buffer = new ArrayBuffer(this.#alignedUniformSize);
            const view = new DataView(buffer);

            for (const [name, value] of this.#uniforms) {
                const type = this.#uniformLayout.get(name);
                const offset = this.#fieldOffsets.get(name);
                
                UniformBuffer.writeValueToBuffer(view, offset, value, type);
            }

            return new Float32Array(buffer);
        } else {
            return UniformBuffer.flattenValues(this.#uniforms.values());
        }
    }
}

export {
    UniformBuffer
};