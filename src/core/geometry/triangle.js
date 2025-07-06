
import { Face } from '../face.js';
import { Geometry } from './geometry.js';
import { Uv } from '../uv.js';
import { Vector3 } from '../vector3.js';

/**
 * A simple triangle geometry class that creates a triangle from three vertices.
 * Extends the base Geometry class to provide triangle-specific functionality.
 * First parameter is bottom-left, second bottom-right and last top-center.
 */
class Triangle extends Geometry
{
    constructor(vertex1, vertex2, vertex3)
    {
        super();
        
        Triangle.#validateVertex(vertex1);
        Triangle.#validateVertex(vertex2);
        Triangle.#validateVertex(vertex3);
        
        const index1 = this.addVertex(vertex1);
        const index2 = this.addVertex(vertex2);
        const index3 = this.addVertex(vertex3);
        
        const triangleFace = new Face([index1, index2, index3]);
        this.addFace(triangleFace);

        this.addUvCoordinate(new Uv(0, 0)); // Bottom-left
        this.addUvCoordinate(new Uv(1, 0)); // Bottom-right  
        this.addUvCoordinate(new Uv(0.5, 1)); // Top-center
    }

    /**
     * Ensures that a vertex is a Vector3 object.
     */
    static #validateVertex(vertex)
    {
        if (!(vertex instanceof Vector3)) {
            throw new TypeError('A vertex must be a Vector3 instance.');
        }
    }
}

export {
    Triangle
};