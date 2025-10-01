
import { BaseBuffer } from './base-buffer.js';
import { Engine } from '../../engine.js';
import { Geometry } from '../geometry/geometry.js';
import { VertexAttributes } from '../vertex-attributes.js';

/**
 * Represents a vertex buffer with metadata for GPU usage.
 */
class VertexBuffer
{
    #buffer;
    #layout;
    #stride;
    #offsets;
    #vertexCount;

    #device = null;
    #compiled = false;
    #gpuBuffer = null;
    #gpuBufferLayout = null;

    constructor(buffer, layout, stride, offsets, vertexCount)
    {
        Geometry.validateBufferLayout(layout);

        this.#buffer = buffer;
        this.#layout = Array.from(layout);
        this.#stride = stride;
        this.#offsets = {...offsets};
        this.#vertexCount = vertexCount;
    }

    /**
     * Gets the Float32Array buffer containing interleaved vertex data.
     */
    getVertexBuffer() {
        return this.#buffer;
    }

    /**
     * Gets the layout array showing the order of components.
     */
    getLayout() {
        return Array.from(this.#layout);
    }

    /**
     * Gets the stride (number of floats per vertex).
     */
    getStride() {
        return this.#stride;
    }

    /**
     * Gets the byte offset for a specific component.
     */
    getByteOffset(component) {
        return this.#offsets[component];
    }

    /**
     * Gets all byte offsets as an object.
     */
    getByteOffsets() {
        return {...this.#offsets};
    }

    /**
     * Gets the number of vertices in the buffer.
     */
    getVertexCount() {
        return this.#vertexCount;
    }

    /**
     * Gets the gpu buffer.
     */
    getGpuVertexBuffer()
    {
        if (!this.#compiled) {
            throw new Error(
                'Geometry must be compiled before accessing vertex buffer!'
            );
        }

        return this.#gpuBuffer;
    }

    /**
     * Gets the gpu buffer layout.
     */
    getVertexBufferLayout()
    {
        if (!this.#compiled) {
            throw new Error(
                'Geometry must be compiled before accessing buffer layout!'
            );
        }

        return this.#gpuBufferLayout;
    }

    /**
     * Compiles the vertex buffer into a WebGPU vertex buffer.
     * This creates a GPU buffer and uploads the vertex data.
     */
    compile(device)
    {
        if (this.#compiled) {
            return;
        }

        Engine.validateDevice(device);
        this.#device = device;

        this.#createVertexBuffer();
        this.#generateVertexBufferLayout();

        this.#compiled = true;
    }

    /**
     * Returns if the vertex buffer is compiled.
     */
    isCompiled() {
        return this.#compiled;
    }

    /**
     * Destroy the vertex buffer contained by this object.
     */
    destroy()
    {
        if (this.#gpuBuffer) {
            this.#gpuBuffer.destroy();
            this.#gpuBuffer = null;
        }

        this.#gpuBufferLayout = null;
        this.#compiled = false;
    }

    /**
     * Compiles the WebGPU vertex buffer.
     */
    #createVertexBuffer()
    {
        this.#gpuBuffer = this.#device.createBuffer({
            size: BaseBuffer.alignBufferSize(
                this.#buffer.byteLength
            ),
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
            mappedAtCreation: true
        });

        const mappedBuffer = this.#gpuBuffer.getMappedRange();
        new Float32Array(mappedBuffer).set(this.#buffer);
        this.#gpuBuffer.unmap();
    }

    /**
     * Generates vertex buffer layout descriptors for WebGPU
     * render pipeline. This creates the vertex buffer layout
     * needed for shader input.
     */
    #generateVertexBufferLayout()
    {
        const attributes = [];
        let shaderLocation = 0;

        for (const component of this.#layout) {
            const format = VertexBuffer.#getWebGPUFormat(component);
            const offset = this.#offsets[component];

            attributes.push({
                format: format,
                offset: offset,
                shaderLocation: shaderLocation
            });

            shaderLocation++;
        }

        this.#gpuBufferLayout = {
            arrayStride: this.#stride * 4,
            stepMode: 'vertex',
            attributes: attributes
        };
    }

    /**
     * Gets the appropriate WebGPU format for a vertex component.
     */
    static #getWebGPUFormat(component)
    {
        switch (component) {
            case VertexAttributes.POSITION:
            case VertexAttributes.NORMAL:
                return 'float32x3';
            case VertexAttributes.UV:
                return 'float32x2';
            case VertexAttributes.COLOR:
                return 'float32x4';
            default:
                throw new Error(`Unknown component type: ${component}`);
        }
    }
}

export {
    VertexBuffer
};