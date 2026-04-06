
import { BaseBuffer } from './base-buffer.js';
import { Engine } from '../../engine.js';

/**
 * Represents an index buffer with metadata for GPU usage.
 */
class IndexBuffer
{
    #buffer;
    #indexCount;
    #indexFormat = 'uint16';

    #device = null;
    #compiled = false;
    #gpuBuffer = null;

    constructor(indices, indexCount)
    {
        this.#buffer = indices;
        this.#indexCount = indexCount;

        this.#indexFormat = this.#indexCount > 65535
            ? 'uint32'
            : 'uint16';
    }

    /**
     * Gets the Uint16Array or Uint32Array buffer containing face indices.
     */
    getIndexBuffer() {
        return this.#buffer;
    }

    /**
     * Gets the format of the index buffer.
     */
    getIndexFormat() {
        return this.#indexFormat;
    }

    /**
     * Gets the number of faces in the buffer.
     */
    getIndexCount() {
        return this.#indexCount;
    }

    /**
     * Gets the gpu index buffer.
     */
    getGpuIndexBuffer()
    {
        if (!this.#compiled) {
            throw new Error(
                'IndexBuffer must be compiled before accessing index buffer!'
            );
        }

        return this.#gpuBuffer;
    }

    /**
     * Compiles the index buffer into a WebGPU ndex buffer.
     * This creates a GPU buffer and uploads the index data.
     */
    compile(device)
    {
        if (this.#compiled) {
            return;
        }

        Engine.validateDevice(device);
        this.#device = device;
        this.#createIndexBuffer();

        this.#compiled = true;
    }

    /**
     * Returns if the index buffer is compiled.
     */
    isCompiled() {
        return this.#compiled;
    }

    /**
     * Destroy the vertex buffer associated with this geometry.
     */
    destroy()
    {
        if (this.#gpuBuffer) {
            this.#gpuBuffer.destroy();
            this.#gpuBuffer = null;
        }

        this.#compiled = false;
    }

    /**
     * Compiles the WebGPU index buffer.
     */
    #createIndexBuffer()
    {
        this.#gpuBuffer = this.#device.createBuffer({
            size: BaseBuffer.alignBufferSize(
                this.#buffer.byteLength
            ),
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.INDEX,
            mappedAtCreation: true
        });

        const mappedBuffer = this.#gpuBuffer.getMappedRange();

        if (this.#indexFormat === 'uint32') {
            new Uint32Array(mappedBuffer).set(this.#buffer);
        } else {
            new Uint16Array(mappedBuffer).set(this.#buffer);
        }

        this.#gpuBuffer.unmap();
    }
}

export {
    IndexBuffer
};