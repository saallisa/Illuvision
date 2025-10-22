
import { Face } from '../face.js';
import { Geometry } from './geometry.js';
import { Uv } from '../uv.js';
import { Vector3 } from '../vector3.js';

/**
 * A simple box geometry class that creates a box with a width, height and
 * depth, as well as faces and uv-coordinates.
 */
class Box extends Geometry
{
    constructor(width = 1, height = 1, depth = 1)
    {
        Box.validateDimension(width, 'width');
        Box.validateDimension(height, 'height');
        Box.validateDimension(depth, 'depth');

        super();

        this.#createBox(width, height, depth);
        this.calculateVertexNormals();
    }

    /**
     * Sets a different color for each face.
     */
    setFaceColors(front, right, back, left, top, buttom)
    {
        const colors = [
            // Front face
            front.clone(),
            front.clone(),
            front.clone(),
            front.clone(),
            
            // Right face
            right.clone(),
            right.clone(),
            right.clone(),
            right.clone(),

            // Back face
            back.clone(),
            back.clone(),
            back.clone(),
            back.clone(),

            // Left face
            left.clone(),
            left.clone(),
            left.clone(),
            left.clone(),

            // Top face
            top.clone(),
            top.clone(),
            top.clone(),
            top.clone(),

            // Bottom face
            buttom.clone(),
            buttom.clone(),
            buttom.clone(),
            buttom.clone()
        ];

        for (const color of colors) {
            this.addVertexColor(color);
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
        /*
         * Order of vertex points
         *   e ---- f
         *  /|     /|
         * a ---- b |
         * | g ---| h
         * |/     |/
         * c ---- d
         */

        const a = new Vector3(-x, y, z);
        const b = new Vector3(x, y, z);
        const c = new Vector3(-x, -y, z);
        const d = new Vector3(x, -y, z);

        const e = new Vector3(-x, y, -z);
        const f = new Vector3(x, y, -z);
        const g = new Vector3(-x, -y, -z);
        const h = new Vector3(x, -y, -z);

        const vertices = [
            // Front face vertices (cdba)
            c.clone(), // 0
            d.clone(), // 1
            b.clone(), // 2
            a.clone(), // 3
            
            // Right face vertices (dhfb)
            d.clone(), // 4
            h.clone(), // 5
            f.clone(), // 6
            b.clone(), // 7

            // Back face vertices (hgef)
            h.clone(), // 8,
            g.clone(), // 9,
            e.clone(), // 10
            f.clone(), // 11

            // Left face vertices (gcae)
            g.clone(), // 12
            c.clone(), // 13
            a.clone(), // 14
            e.clone(), // 15

            // Top face vertices (abfe)
            a.clone(), // 16
            b.clone(), // 17
            f.clone(), // 18
            e.clone(), // 19

            // Bottom face vertices (ghdc)
            g.clone(), // 20
            h.clone(), // 21
            d.clone(), // 22
            c.clone() // 23
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
            // Front face
            new Face([0, 1, 2]),
            new Face([0, 2, 3]),
            // Right face
            new Face([4, 5, 6]),
            new Face([4, 6, 7]),
            // Back face
            new Face([8, 9, 10]),
            new Face([8, 10, 11]),
            // Left face
            new Face([12, 13, 14]),
            new Face([12, 14, 15]),
            // Top face
            new Face([16, 17, 18]),
            new Face([16, 18, 19]),
            // Bottom face
            new Face([20, 21, 22]),
            new Face([20, 22, 23])
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

            // Right face UVs
            new Uv(0, 0), // 12: bottom-left
            new Uv(1, 0), // 13: bottom-right
            new Uv(1, 1), // 14: top-right
            new Uv(0, 1), // 15: top-left
            
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