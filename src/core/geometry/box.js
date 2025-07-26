
import { Face } from '../face.js';
import { Geometry } from './geometry.js';
import { Uv } from '../uv.js';
import { Vector3 } from '../vector3.js';

/**
 * A simple box geometry class that creates a box with a width, height and
 * depth, as well as faces and uv-coordinates. Is automatically triangulated
 * if not disabled.
 */
class Box extends Geometry
{
    constructor(width = 1, height = 1, depth = 1, triangulate = true)
    {
        Box.validateDimension(width, 'width');
        Box.validateDimension(height, 'height');
        Box.validateDimension(depth, 'depth');

        super();

        this.#createBox(width, height, depth);

        if (triangulate === true) {
            this.triangulate();
        }
    }

    /**
     * Creates the box geometry with vertices, faces and uv-coordinates.
     */
    #createBox(width, height, depth)
    {
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const halfDepth = depth / 2;

        this.#createBoxVertices(halfWidth, halfHeight, halfDepth);
        this.#createBoxFaces();
        this.#createBoxUv();
    }

    /**
     * Creates all the box vertices.
     */
    #createBoxVertices(x, y, z)
    {
        const vertices = [
            // Front face vertices
            new Vector3(-x, -y, z),  // 0: bottom-left-front
            new Vector3(x, -y, z),   // 1: bottom-right-front
            new Vector3(x, y, z),    // 2: top-right-front
            new Vector3(-x, y, z),   // 3: top-left-front
            
            // Back face vertices
            new Vector3(-x, -y, -z), // 4: bottom-left-back
            new Vector3(x, -y, -z),  // 5: bottom-right-back
            new Vector3(x, y, -z),   // 6: top-right-back
            new Vector3(-x, y, -z)   // 7: top-left-back
        ];

        for (const vertex of vertices) {
            this.addVertex(vertex);
        }
    }

    /**
     * Creates all the box faces.
     */
    #createBoxFaces()
    {
        const faces = [
            new Face([0, 1, 2, 3]), // Front face
            new Face([5, 4, 7, 6]), // Back face
            new Face([4, 0, 3, 7]), // Left face
            new Face([1, 5, 6, 2]), // Right face
            new Face([4, 5, 1, 0]), // Bottom face
            new Face([3, 2, 6, 7]) // Top face
        ];

        // Add faces to geometry
        for (const face of faces) {
            this.addFace(face);
        }
    }

    /**
     * Creates all the box uv-coordinates.
     */
    #createBoxUv()
    {
        const uvCoordinates = [
            // Front face UVs
            new Uv(0, 0), // 0: bottom-left
            new Uv(1, 0), // 1: bottom-right
            new Uv(1, 1), // 2: top-right
            new Uv(0, 1), // 3: top-left
            
            // Back face UVs
            new Uv(0, 0), // 4: bottom-left
            new Uv(1, 0), // 5: bottom-right
            new Uv(1, 1), // 6: top-right
            new Uv(0, 1)  // 7: top-left
        ];

        for (const uv of uvCoordinates) {
            this.addUvCoordinate(uv);
        }
    }
}

export {
    Box
};