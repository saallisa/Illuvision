
import { Engine } from '../../engine.js';
import { Geometry } from '../geometry/geometry.js';

/**
 * Represents a flattened geometry buffer with metadata for GPU usage.
 */
class GeometryBuffer
{
    #buffer;
    #layout;
    #stride;
    #offsets;
    #vertexCount;
    #indexBuffer = null;
    #indexCount = null;

    #device = null;
    #compiled = false;
    #gpuBuffer = null;
    #gpuBufferLayout = null;
    #gpuIndexBuffer = null;

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
    getBuffer() {
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
     * Gets the Uint16Array buffer containing face indices.
     */
    getIndexBuffer() {
        return this.#indexBuffer;
    }

    /**
     * Gets the number of faces in the buffer.
     */
    getIndexCount() {
        return this.#indexCount;
    }

    /**
     * Gets the total size of the buffer in bytes.
     */
    getBufferSize() {
        return this.#buffer.byteLength;
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
     * Gets the gpu index buffer.
     */
    getGpuIndexBuffer()
    {
        if (!this.#compiled) {
            throw new Error(
                'Geometry must be compiled before accessing index buffer!'
            );
        }

        return this.#gpuIndexBuffer;
    }

    /**
     * Adds indices and index count to this Geometry buffer.
     */
    addIndices(indices, indexCount)
    {
        this.#indexBuffer = indices;
        this.#indexCount = indexCount;
    }

    /**
     * Compiles the geometry buffer into a WebGPU vertex buffer.
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

        if (this.#indexBuffer) {
            this.#createIndexBuffer();
        }

        this.#compiled = true;
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

        if (this.#gpuIndexBuffer) {
            this.#gpuIndexBuffer.destroy();
            this.#gpuIndexBuffer = null;
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
            size: this.#buffer.byteLength,
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
            const format = GeometryBuffer.#getWebGPUFormat(component);
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
     * Compiles the WebGPU index buffer.
     */
    #createIndexBuffer()
    {
        this.#gpuIndexBuffer = this.#device.createBuffer({
            size: this.#indexBuffer.byteLength,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.INDEX,
            mappedAtCreation: true
        });

        const mappedBuffer = this.#gpuIndexBuffer.getMappedRange();
        new Uint16Array(mappedBuffer).set(this.#indexBuffer);
        this.#gpuIndexBuffer.unmap();
    }

    /**
     * Gets the appropriate WebGPU format for a geometry component.
     */
    static #getWebGPUFormat(component)
    {
        switch (component) {
            case Geometry.VERTEX:
            case Geometry.NORMAL:
                return 'float32x3';
            case Geometry.UV:
                return 'float32x2';
            case Geometry.COLOR:
                return 'float32x4';
            default:
                throw new Error(`Unknown component type: ${component}`);
        }
    }
}

export {
    GeometryBuffer
};