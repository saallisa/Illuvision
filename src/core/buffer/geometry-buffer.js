
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
     * Gets the total size of the buffer in bytes.
     */
    getBufferSize() {
        return this.#buffer.byteLength;
    }
}

export {
    GeometryBuffer
};