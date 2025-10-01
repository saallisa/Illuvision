
import { Color } from './color.js';
import { Vector3 } from './vector3.js';

/**
 * Base class for all objects (geometries, lines and points)
 * Provides a common interface for buffer creation and data management.
 */
class Object
{
    #id = null;
    #vertices = [];
    #vertexColors = [];

    constructor()
    {
        if (this.constructor === Object) {
            throw new Error('Object cannot be instantiated directly.');
        }

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
     * Gets a copy of all vertex colors.
     */
    getVertexColors() {
        return Array.from(this.#vertexColors);
    }

    /**
     * Gets a single vertex by its index.
     */
    getVertex(index) {
        return this.#vertices[index];
    }

    /**
     * Gets a single vertex color by its index.
     */
    getVertexColor(index) {
        return this.#vertexColors[index];
    }

    /**
     * Gets the number of vertices in the object.
     */
    getVertexCount() {
        return this.#vertices.length;
    }

    /**
     * Gets the number of vertex colors in the object.
     */
    getVertexColorCount() {
        return this.#vertexColors.length;
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

    /**
     * Adds a vertex color to the object
     */
    addVertexColor(vertexColor)
    {
        if (!(vertexColor instanceof Color)) {
            throw new TypeError('Vertex color must be a Color instance.');
        }

        this.#vertexColors.push(vertexColor.clone());
    }

    /**
     * Validates that vertex color count matches vertex count.
     */
    validateColorCount()
    {
        if (this.#vertices.length !== this.#vertexColors.length) {
            throw new Error('Vertex color count must match vertex count.');
        }
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