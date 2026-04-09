
import { Face } from '../face.js';
import { Geometry } from './geometry.js';
import { Vector3 } from '../math/vector3.js';

/**
 * A simple box geometry class that creates a box with a width, height and
 * depth, as well as faces and uv-coordinates.
 */
class Box extends Geometry
{
    constructor(width = 1, height = 1, depth = 1, options = {})
    {
        Box.validateDimension(width, 'width');
        Box.validateDimension(height, 'height');
        Box.validateDimension(depth, 'depth');

        super();

        this.#createBox(width, height, depth);

        let mode = Box.UVS_PER_FACE;

        if (options.uvMode) {
            this.#validateUvMode(options.uvMode);
            mode = options.uvMode;
        }

        switch (mode) {
            case Box.UVS_ATLAS: this.#createBoxUvAtlas();
                break;
            case Box.UVS_NONE:
                break;
            case Box.UVS_PER_FACE:
            default: this.#createBoxUvPerFace();
                break;
        }

        this.calculateVertexNormals();
    }

    /**
     * Sets a different color for each face.
     */
    setFaceColors(front, right, back, left, top, bottom)
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
            bottom.clone(),
            bottom.clone(),
            bottom.clone(),
            bottom.clone()
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
     * Creates all the box uv-coordinates with each face looking the same way.
     */
    #createBoxUvPerFace()
    {
        for (let i = 0; i < 6; i++) {
            this.addUvCoordinate(0, 0); // bottom-left
            this.addUvCoordinate(1, 0); // bottom-right
            this.addUvCoordinate(1, 1); // top-right
            this.addUvCoordinate(0, 1); // top-left
        }
    }

    /**
     * Creates all the box uv-coordinates with each face using another part of
     * a texture atlas.
     */
    #createBoxUvAtlas()
    {
        // Three columns and two rows in the texture atlas
        const column = 1 / 3;
        const row = 1 / 2;

        // Front face (column 2, row 0)
        this.addUvCoordinate(2 * column, row); // 0: bottom-left
        this.addUvCoordinate(3 * column, row); // 1: bottom-right
        this.addUvCoordinate(3 * column, 0); // 2: top-right
        this.addUvCoordinate(2 * column, 0); // 3: top-left

        // Right face (column 0, row 0)
        this.addUvCoordinate(0, row); // 4: bottom-left
        this.addUvCoordinate(column, row); // 5: bottom-right
        this.addUvCoordinate(column, 0); // 6: top-right
        this.addUvCoordinate(0, 0); // 7: top-left

        // Back face (column 2, row 1)
        this.addUvCoordinate(2 * column, 1); // 8: bottom-left
        this.addUvCoordinate(3 * column, 1); // 9: bottom-right
        this.addUvCoordinate(3 * column, row); // 10: top-right
        this.addUvCoordinate(2 * column, row); // 11: top-left

        // Left face (column 0, row 1)
        this.addUvCoordinate(0, 1); // 12: bottom-left
        this.addUvCoordinate(column, 1); // 13: bottom-right
        this.addUvCoordinate(column, row); // 14: top-right
        this.addUvCoordinate(0, row); // 15: top-left

        // Top face (column 1, row 0)
        this.addUvCoordinate(column, row); // 16: bottom-left
        this.addUvCoordinate(2 * column, row); // 17: bottom-right
        this.addUvCoordinate(2 * column, 0); // 18: top-right
        this.addUvCoordinate(column, 0); // 19: top-left

        // Bottom face (column 1, row 1)
        this.addUvCoordinate(column, 1); // 20: bottom-left
        this.addUvCoordinate(2 * column, 1); // 21: bottom-right
        this.addUvCoordinate(2 * column, row); // 22: top-right
        this.addUvCoordinate(column, row); // 23: top-left
    }

    /**
     * Checks if an input value is valid uv mode.
     */
    #validateUvMode(uvMode)
    {
        const validModes = [
            Box.UVS_PER_FACE,
            Box.UVS_ATLAS,
            Box.UVS_NONE
        ];

        if (!validModes.includes(uvMode)) {
            throw new Error(
                `Invalid box uv mode: ${uvMode}.`
            );
        }
    }

    // Pseudo constants for uv modes

    static get UVS_NONE() {
        return 'none';
    }

    static get UVS_ATLAS() {
        return 'atlas';
    }

    static get UVS_PER_FACE() {
        return 'per-face';
    }
}

export {
    Box
};