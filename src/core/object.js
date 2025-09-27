
import { Vector3 } from './vector3.js';

/**
 * Base class for all objects (geometries, lines and points)
 * Provides a common interface for buffer creation and data management.
 */
class Object
{
    #id = null;
    #vertices = [];

    constructor() {
        this.#id = crypto.randomUUID();
    }

    /**
     * Gets the universally unique identifier of this object.
     */
    getId() {
        return this.#id;
    }

    /**
     * Abstract method: Gets the rendering topology.
     * Must be implemented by subclasses.
     */
    getTopology() {
        throw new Error('getTopology() must be implemented by subclass');
    }

    /**
     * Gets a copy of all vertices.
     */
    getVertices() {
        return Array.from(this.#vertices);
    }

    /**
     * Gets a single vertex by its index.
     */
    getVertex(index) {
        return this.#vertices[index];
    }

    /**
     * Gets the number of vertices in the object.
     */
    getVertexCount() {
        return this.#vertices.length;
    }

    /**
     * Adds a vertex to the object and return its index.
     */
    addVertex(vertex)
    {
        if (!(vertex instanceof Vector3)) {
            throw new TypeError('Expected a Vector3 instance.');
        }

        this.#vertices.push(vertex.clone());

        // Return the index of the newly added vertex
        return this.#vertices.length - 1;
    }

    // Topology constants
    static get TRIANGLES() {
        return 'triangle-list';
    }

    static get LINES() {
        return 'line-list';
    }

    static get POINTS() {
        return 'point-list';
    }
}

export {
    Object
};