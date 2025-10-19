
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

        this.calculateVertexNormals();
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
            new Vector3(-x, y, -z),  // 7: top-left-back

            // Left face vertices
            new Vector3(-x, -y, z),  // 8: bottom-left-front
            new Vector3(-x, -y, -z), // 9: bottom-left-back
            new Vector3(-x, y, -z),  // 10: top-left-back
            new Vector3(-x, y, z),   // 11: top-left-front

            // Right face vertices
            new Vector3(x, -y, -z),  // 15: bottom-right-back
            new Vector3(x, y, -z),   // 14: top-right-back
            new Vector3(x, y, z),    // 13: top-right-front
            new Vector3(x, -y, z),   // 12: bottom-right-front

            // Top face vertices
            new Vector3(-x, y, z),   // 16: top-left-front
            new Vector3(x, y, z),    // 17: top-right-front
            new Vector3(x, y, -z),   // 18: top-right-back
            new Vector3(-x, y, -z),  // 19: top-left-back

            // Bottom face vertices
            new Vector3(-x, -y, z),  // 20: bottom-left-front
            new Vector3(-x, -y, -z), // 21: bottom-left-back
            new Vector3(x, -y, -z),  // 22: bottom-right-back
            new Vector3(x, -y, z)    // 23: bottom-right-front
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
            new Face([7, 6, 5, 4]), // Back face
            new Face([8, 9, 10, 11]),  // Left face
            new Face([12, 13, 14, 15]), // Right face
            new Face([16, 17, 18, 19]), // Top face
            new Face([20, 21, 22, 23])  // Bottom face
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
            new Uv(0, 1), // 7: top-left

            // Left face UVs
            new Uv(0, 0), // 8: bottom-left
            new Uv(1, 0), // 9: bottom-right
            new Uv(1, 1), // 10: top-right
            new Uv(0, 1), // 11: top-left

            // Right face UVs
            new Uv(0, 0), // 12: bottom-left
            new Uv(1, 0), // 13: bottom-right
            new Uv(1, 1), // 14: top-right
            new Uv(0, 1), // 15: top-left

            // Top face UVs
            new Uv(0, 0), // 16: bottom-left
            new Uv(1, 0), // 17: bottom-right
            new Uv(1, 1), // 18: top-right
            new Uv(0, 1), // 19: top-left

            // Bottom face UVs
            new Uv(0, 0), // 20: bottom-left
            new Uv(1, 0), // 21: bottom-right
            new Uv(1, 1), // 22: top-right
            new Uv(0, 1)  // 23: top-left
        ];

        for (const uv of uvCoordinates) {
            this.addUvCoordinate(uv);
        }
    }
}

export {
    Box
};