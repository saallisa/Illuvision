
import { BaseBuffer } from './base-buffer.js';
import { Engine } from '../../engine.js';

/**
 * Manages WebGPU uniform buffers with automatic resizing and validation.
 */
class UniformBuffer extends BaseBuffer
{
    #uniforms = new Map();
    #uniformLayout = new Map();

    #uniformBuffer = null;
    #compiled = false;

    /**
     * Sets a uniform value.
     */
    setUniform(name, value, type)
    {
        if (typeof name !== 'string' || name.trim().length === 0) {
            throw new TypeError('Uniform name must be a non-empty string.');
        }

        UniformBuffer.#validateUniformValue(value);
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
     * Compiles the uniform buffer.
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
     * Creates a uniform buffer for the current uniforms.
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
}

export {
    UniformBuffer
};